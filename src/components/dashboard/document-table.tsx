'use client';

import * as React from 'react';
import type { Document as DocumentType } from '@/lib/types';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  FileText,
  HeartPulse,
  Scale,
  GraduationCap,
  Landmark,
  User,
  FileQuestion,
  Download,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const categoryIcons: Record<DocumentType['category'], React.ReactElement> = {
  Medical: <HeartPulse className="h-4 w-4" />,
  Legal: <Scale className="h-4 w-4" />,
  Academic: <GraduationCap className="h-4 w-4" />,
  Financial: <Landmark className="h-4 w-4" />,
  Personal: <User className="h-4 w-4" />,
  Other: <FileQuestion className="h-4 w-4" />,
};

// Theme-aware colors using CSS variables from globals.css
const categoryColors: Record<DocumentType['category'], string> = {
    Medical: 'bg-chart-1/20 text-chart-1',
    Legal: 'bg-chart-2/20 text-chart-2',
    Academic: 'bg-chart-3/20 text-chart-3',
    Financial: 'bg-chart-4/20 text-chart-4',
    Personal: 'bg-chart-5/20 text-chart-5',
    Other: 'bg-muted text-muted-foreground',
}

type Props = {
  searchTerm: string;
};

export function DocumentTable({ searchTerm }: Props) {
  const [documents, setDocuments] = React.useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!user) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    const q = query(collection(db, "documents"), where("userId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docsData: DocumentType[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            docsData.push({
                id: doc.id,
                name: data.name,
                category: data.category,
                createdAt: (data.createdAt as Timestamp).toDate(),
                size: data.size,
                content: data.content || '', // Ensure content is not undefined
            });
        });
        setDocuments(docsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching documents:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch documents.' });
        setIsLoading(false);
    });

    return () => unsubscribe();

  }, [user, toast]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "documents", id));
      toast({
        title: 'Document Deleted',
        description: 'The document has been successfully deleted.',
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the document.',
      });
    }
  };

  const handleDownload = async (docToDownload: DocumentType) => {
    let contentToDownload = docToDownload.content;
    
    // If content is not loaded with the list, fetch it
    if (!contentToDownload) {
        try {
            const docRef = doc(db, "documents", docToDownload.id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                contentToDownload = docSnap.data().content || '';
            } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Document not found.' });
                 return;
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch document content.' });
            return;
        }
    }
    
    if (!contentToDownload) {
        toast({ title: 'Download Failed', description: 'This document has no content to download.', variant: 'destructive' });
        return;
    }

    const blob = new Blob([contentToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // ensure the downloaded file has a .txt extension
    const fileName = docToDownload.name.endsWith('.txt') ? docToDownload.name : `${docToDownload.name}.txt`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
     toast({
        title: 'Download Started',
        description: `Downloading ${fileName}`,
    });
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <AlertDialog>
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Date Added</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                         <div className="flex justify-center items-center">
                           <Loader2 className="h-6 w-6 animate-spin mr-2"/> Loading documents...
                         </div>
                      </TableCell>
                  </TableRow>
              ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                      <TableCell className="hidden sm:table-cell">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">
                      <Link href={`/dashboard/document/${doc.id}`} className="hover:underline">
                          {doc.name}
                      </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`border-0 font-medium ${categoryColors[doc.category]}`}>
                          {categoryIcons[doc.category]}
                          <span className="ml-2">{doc.category}</span>
                      </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{format(doc.createdAt, 'PP')}</TableCell>
                      <TableCell className="hidden md:table-cell">{doc.size}</TableCell>
                      <TableCell>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                          </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Link href={`/dashboard/document/${doc.id}`} passHref>
                              <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> Q&amp;A / Preview
                              </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="mr-2 h-4 w-4" /> Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                           <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                onSelect={(e) => e.preventDefault()}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                           </AlertDialogTrigger>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                document and remove your data from our servers.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(doc.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                      </AlertDialogContent>
                      </TableCell>
                  </TableRow>
                  ))
              ) : (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center p-8 text-muted-foreground">
                          {searchTerm ? `No documents found for "${searchTerm}"` : "No documents found. Upload your first document to get started!"}
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </AlertDialog>
    </>
  );
}
