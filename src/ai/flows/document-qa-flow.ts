'use server';
/**
 * @fileOverview An AI flow for answering questions about a document.
 *
 * - documentQA - A function that handles the document Q&A process.
 * - DocumentQAInput - The input type for the documentQA function.
 * - DocumentQAOutput - The return type for the documentQA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentQAInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to be queried.'),
  question: z.string().describe('The user\'s question about the document.'),
});
export type DocumentQAInput = z.infer<typeof DocumentQAInputSchema>;

const DocumentQAOutputSchema = z.object({
  answer: z
    .string()
    .describe('The AI-generated answer to the question, based on the document text.'),
});
export type DocumentQAOutput = z.infer<typeof DocumentQAOutputSchema>;

export async function documentQA(input: DocumentQAInput): Promise<DocumentQAOutput> {
  return documentQAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentQAPrompt',
  input: {schema: DocumentQAInputSchema},
  output: {schema: DocumentQAOutputSchema},
  prompt: `You are a helpful AI assistant assigned to answer questions about a specific document.

  The user has provided a document and a question. Your task is to carefully read the document text and provide a concise answer to the user's question, using ONLY the information found within the document.

  Do not use any external knowledge. If the answer cannot be found in the document, state that clearly.

  Document Text:
  """
  {{{documentText}}}
  """

  Question:
  "{{{question}}}"
  `,
});

const documentQAFlow = ai.defineFlow(
  {
    name: 'documentQAFlow',
    inputSchema: DocumentQAInputSchema,
    outputSchema: DocumentQAOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
