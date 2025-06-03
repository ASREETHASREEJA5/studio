'use server';

/**
 * @fileOverview Classifies documents by format and business intent.
 *
 * - classifyDocument - A function that classifies a document and routes it to the appropriate agent.
 * - ClassifyDocumentInput - The input type for the classifyDocument function.
 * - ClassifyDocumentOutput - The return type for the classifyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyDocumentInputSchema = z.object({
  documentContent: z.string().describe('The content of the document to classify.'),
  documentFormat: z.enum(['Email', 'JSON', 'PDF']).describe('The format of the document.'),
});
export type ClassifyDocumentInput = z.infer<typeof ClassifyDocumentInputSchema>;

const ClassifyDocumentOutputSchema = z.object({
  format: z.enum(['Email', 'JSON', 'PDF']).describe('The format of the document.'),
  intent: z
    .enum(['RFQ', 'Complaint', 'Invoice', 'Regulation', 'Fraud Risk'])
    .describe('The business intent of the document.'),
});
export type ClassifyDocumentOutput = z.infer<typeof ClassifyDocumentOutputSchema>;

export async function classifyDocument(input: ClassifyDocumentInput): Promise<ClassifyDocumentOutput> {
  return classifyDocumentFlow(input);
}

const classifyDocumentPrompt = ai.definePrompt({
  name: 'classifyDocumentPrompt',
  input: {schema: ClassifyDocumentInputSchema},
  output: {schema: ClassifyDocumentOutputSchema},
  prompt: `You are an expert document classifier. You will determine the format and business intent of the document.

  The document format will be one of the following: Email, JSON, PDF.
  The business intent will be one of the following: RFQ, Complaint, Invoice, Regulation, Fraud Risk.

  Here are some examples:
  Document: "Dear Sir/Madam, I am writing to complain about...", Format: Email, Intent: Complaint
  Document: {...}, Format: JSON, Intent: RFQ
  Document: [PDF content], Format: PDF, Intent: Invoice

  Now classify the following document:
  Format: {{{documentFormat}}}
  Content: {{{documentContent}}}

  Format:`, // Omit intent for LLM to predict it
});

const classifyDocumentFlow = ai.defineFlow(
  {
    name: 'classifyDocumentFlow',
    inputSchema: ClassifyDocumentInputSchema,
    outputSchema: ClassifyDocumentOutputSchema,
  },
  async input => {
    const {output} = await classifyDocumentPrompt(input);
    return output!;
  }
);
