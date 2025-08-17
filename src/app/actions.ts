'use server';

import { autoCategorizeDocument } from '@/ai/flows/auto-categorize-document';
import { documentQA } from '@/ai/flows/document-qa-flow';

export async function runAutoCategorize(documentText: string) {
  try {
    const result = await autoCategorizeDocument({ documentText });
    return result;
  } catch (error) {
    console.error('Error in auto-categorization:', error);
    // In a real app, you might want to throw a more specific error
    // or return a structured error object.
    throw new Error('Failed to categorize document with AI.');
  }
}

export async function runDocumentQA(documentText: string, question: string) {
    if (!documentText || !question) {
        throw new Error('Document text and question are required.');
    }
    try {
        const result = await documentQA({ documentText, question });
        return result;
    } catch (error) {
        console.error('Error in Document Q&A:', error);
        throw new Error('Failed to get an answer from the document.');
    }
}
