'use client';
import { ArrowLeft, Loader2, Send, Bot, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { runDocumentQA } from '@/app/actions';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Document as DocumentType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export default function DocumentQAPage() {
  const params = useParams();
  const docId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [document, setDocument] = useState<DocumentType | null>(null);
  const [isDocLoading, setIsDocLoading] = useState(true);

  useEffect(() => {
    if (!docId) return;
    
    const fetchDocument = async () => {
        setIsDocLoading(true);
        const docRef = doc(db, 'documents', docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            setDocument({ id: docSnap.id, ...docSnap.data() } as DocumentType);
        } else {
            setError("Document not found.");
        }
        setIsDocLoading(false);
    };

    fetchDocument();
  }, [docId]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isAnswering || !document?.content) return;

    const userMessage: Message = { role: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsAnswering(true);
    setError(null);

    try {
      const result = await runDocumentQA(document.content, inputValue);
      const botMessage: Message = { role: 'bot', text: result.answer };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
       const botMessage: Message = { role: 'bot', text: `Sorry, I ran into an error: ${errorMessage}` };
       setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsAnswering(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const renderDocContent = () => {
    if (isDocLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        )
    }
    if (error) {
        return <p className="text-destructive">{error}</p>
    }
    if (!document?.content) {
         return <p className="text-muted-foreground">No content available for this document. Please upload documents with text content to use the Q&A feature.</p>
    }
    return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{document.content}</p>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
       <header className="flex items-center gap-4 p-4 border-b">
         <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
            </Link>
         </Button>
         <h1 className="font-semibold text-xl">{document?.name || 'Loading...'}</h1>
       </header>
       <main className="flex-1 grid md:grid-cols-2 gap-6 p-6 overflow-hidden">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Document Content</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
                {renderDocContent()}
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>Ask Your Document</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                 <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground p-8">
                                <p>Ask a question about the document to get started.</p>
                                <p className="text-xs mt-2">e.g., "What was the net profit in 2023?"</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'bot' && (
                                    <div className="bg-primary rounded-full p-2 text-primary-foreground">
                                        <Bot className="h-5 w-5"/>
                                    </div>
                                )}
                                <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                                {message.role === 'user' && (
                                     <div className="bg-muted rounded-full p-2">
                                        <User className="h-5 w-5 text-muted-foreground"/>
                                    </div>
                                )}
                            </div>
                        ))}
                         {isAnswering && (
                            <div className="flex items-start gap-3">
                                <div className="bg-primary rounded-full p-2 text-primary-foreground">
                                    <Bot className="h-5 w-5"/>
                                </div>
                                <div className="max-w-xs lg:max-w-md rounded-lg p-3 bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                 <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2 border-t pt-4">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1"
                        disabled={isAnswering || !document?.content}
                    />
                    <Button type="submit" disabled={isAnswering || !inputValue.trim() || !document?.content}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardContent>
        </Card>
       </main>
    </div>
  )
}
