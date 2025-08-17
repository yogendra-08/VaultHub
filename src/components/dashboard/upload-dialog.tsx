'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { runAutoCategorize } from '@/app/actions';
import React from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type Props = {
  children: React.ReactNode;
};

export function UploadDialog({ children }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [documentText, setDocumentText] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [isCategorizing, setIsCategorizing] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<{ category: string; confidence: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAutoCategorize = async () => {
    if (!documentText.trim()) {
      setError('Please paste some document text to analyze.');
      return;
    }
    setError(null);
    setIsCategorizing(true);
    setAiResult(null);
    try {
      const result = await runAutoCategorize(documentText);
      if (result) {
        setAiResult(result);
        setCategory(result.category);
      } else {
        throw new Error('Failed to get a category.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsCategorizing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setDocumentText('');
    setCategory('');
    setAiResult(null);
    setError(null);
    setIsUploading(false);
    setIsCategorizing(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState();
    }
    setIsOpen(open);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // You could add logic here to extract text from PDF or DOCX automatically
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category || !user) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a file and category.'});
        return;
    }
    setIsUploading(true);

    try {
        // In a real app, you would upload the file to a storage service (like Firebase Storage)
        // For now, we'll just save the metadata and text to Firestore.
        const docRef = await addDoc(collection(db, "documents"), {
            userId: user.uid,
            name: file.name,
            category: category,
            content: documentText, // Storing text directly in Firestore for this example
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            createdAt: serverTimestamp(),
        });

        toast({
            title: 'Upload Successful',
            description: 'Your document has been securely uploaded.',
        });
        handleOpenChange(false);
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'There was an error uploading your document.',
        });
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleUpload}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new file to your secure vault. You can also use our AI to automatically categorize it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="picture">Document File</Label>
              <Input id="picture" type="file" required onChange={handleFileChange} />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Document Text (for AI categorization)</Label>
              <Textarea
                placeholder="Paste the text from your document here... the more text, the better the AI works!"
                id="message"
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={handleAutoCategorize} disabled={isCategorizing || !documentText.trim()}>
              {isCategorizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Auto-Categorize with AI
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {aiResult && (
              <Alert>
                <AlertTitle>AI Suggestion</AlertTitle>
                <AlertDescription>
                  We suggest the category <strong>{aiResult.category}</strong> with{' '}
                  {(aiResult.confidence * 100).toFixed(0)}% confidence.
                </AlertDescription>
              </Alert>
            )}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Financial">Financial</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUploading || !file || !category}>
             {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload File
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
