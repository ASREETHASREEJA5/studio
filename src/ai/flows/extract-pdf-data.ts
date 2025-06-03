'use server';

/**
 * @fileOverview This flow extracts data from PDF documents, including invoice line items and policy content, and flags key details.
 *
 * - extractPdfData - Extracts data from PDF files and flags specific details.
 * - ExtractPdfDataInput - Input type for the extractPdfData function.
 * - ExtractPdfDataOutput - Return type for the extractPdfData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPdfDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document content as a data URI, including MIME type and Base64 encoding (e.g., data:application/pdf;base64,...).'
    ),
});
export type ExtractPdfDataInput = z.infer<typeof ExtractPdfDataInputSchema>;

const ExtractPdfDataOutputSchema = z.object({
  invoiceDetails: z
    .object({
      totalAmount: z.number().optional().describe('The total amount of the invoice, if present.'),
      lineItems: z
        .array(
          z.object({
            description: z.string().describe('Description of the line item.'),
            amount: z.number().describe('Amount of the line item.'),
          })
        )
        .optional()
        .describe('Line items of the invoice, if present.'),
    })
    .optional()
    .describe('Details extracted from the invoice, if the PDF is an invoice.'),
  policyDetails: z
    .object({
      mentionsGDPR: z
        .boolean()
        .optional()
        .describe('Whether the policy document mentions GDPR.'),
      mentionsFDA: z.boolean().optional().describe('Whether the policy document mentions FDA.'),
    })
    .optional()
    .describe('Details extracted from the policy document, if the PDF is a policy document.'),
  extractedText: z.string().describe('The extracted text content from the PDF.'),
  isInvoice: z.boolean().describe('True if the PDF appears to be an invoice.'),
  isPolicy: z.boolean().describe('True if the PDF appears to be a policy document.'),
  flagged: z.boolean().describe('Whether the document has been flagged based on criteria.'),
});
export type ExtractPdfDataOutput = z.infer<typeof ExtractPdfDataOutputSchema>;

export async function extractPdfData(input: ExtractPdfDataInput): Promise<ExtractPdfDataOutput> {
  return extractPdfDataFlow(input);
}

const extractPdfDataPrompt = ai.definePrompt({
  name: 'extractPdfDataPrompt',
  input: {schema: ExtractPdfDataInputSchema},
  output: {schema: ExtractPdfDataOutputSchema},
  prompt: `You are an expert document analyst.

  Analyze the provided PDF document and extract relevant information based on its type. The PDF can be one of the following:
  1. Invoice: Extract the total amount and line items.
  2. Policy Document: Check for mentions of GDPR and FDA.

  Here is the PDF document content:
  {{media url=pdfDataUri}}

  Based on the content, determine if the PDF is an invoice or a policy document. Set the isInvoice and isPolicy fields accordingly. Extract the text from the document to help determine which type of document it is.
  If it is an invoice and the total invoice amount is greater than $10,000, flag it. If it is a policy document and it mentions GDPR or FDA, flag it.
  Set the flagged output appropriately.
  If the document is neither an invoice nor a policy, return empty values for the invoiceDetails and policyDetails fields and return false for isInvoice and isPolicy.
  Ensure that the extractedText field always contains the text from the document.
`,
});

const extractPdfDataFlow = ai.defineFlow(
  {
    name: 'extractPdfDataFlow',
    inputSchema: ExtractPdfDataInputSchema,
    outputSchema: ExtractPdfDataOutputSchema,
  },
  async input => {
    const {output} = await extractPdfDataPrompt(input);

    let flagged = false;
    if (output?.isInvoice && output.invoiceDetails?.totalAmount && output.invoiceDetails.totalAmount > 10000) {
      flagged = true;
    }
    if (output?.isPolicy && (output.policyDetails?.mentionsGDPR || output.policyDetails?.mentionsFDA)) {
      flagged = true;
    }

    return {
      ...output!,
      flagged,
    };
  }
);
