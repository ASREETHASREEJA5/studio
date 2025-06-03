'use server';

/**
 * @fileOverview A Genkit flow for extracting data from emails, including sender, urgency, issue/request, and tone,
 * and triggering actions based on this extracted information.
 *
 * - extractEmailData - A function that handles the email data extraction process.
 * - ExtractEmailDataInput - The input type for the extractEmailData function.
 * - ExtractEmailDataOutput - The return type for the extractEmailData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractEmailDataInputSchema = z.object({
  emailContent: z.string().describe('The content of the email to be processed.'),
});

export type ExtractEmailDataInput = z.infer<typeof ExtractEmailDataInputSchema>;

const ExtractEmailDataOutputSchema = z.object({
  sender: z.string().describe('The sender of the email.'),
  urgency: z.string().describe('The urgency level of the email (e.g., high, medium, low).'),
  issueRequest: z.string().describe('A brief description of the issue or request in the email.'),
  tone: z.string().describe('The tone of the email (e.g., escalation, polite, threatening).'),
  actionTriggered: z
    .string()
    .optional()
    .describe('The action triggered based on the email data (e.g., escalate to CRM).'),
});

export type ExtractEmailDataOutput = z.infer<typeof ExtractEmailDataOutputSchema>;

export async function extractEmailData(input: ExtractEmailDataInput): Promise<ExtractEmailDataOutput> {
  return extractEmailDataFlow(input);
}

const extractEmailDataPrompt = ai.definePrompt({
  name: 'extractEmailDataPrompt',
  input: {schema: ExtractEmailDataInputSchema},
  output: {schema: ExtractEmailDataOutputSchema},
  prompt: `You are an AI assistant specializing in processing emails.
  Your task is to extract key information from the email content provided and determine the appropriate action to trigger.

  Analyze the following email content:
  {{emailContent}}

  Extract the following fields:
  - Sender: The email address of the sender.
  - Urgency: The urgency level of the email (e.g., high, medium, low).
  - Issue/Request: A brief description of the issue or request in the email.
  - Tone: The tone of the email (e.g., escalation, polite, threatening).

  Based on the extracted information, determine if any action should be triggered.
  For example, if the tone is angry and the urgency is high, you should trigger an escalation to the CRM system.

  Return the extracted data and the triggered action (if any) in JSON format.`,
});

const extractEmailDataFlow = ai.defineFlow(
  {
    name: 'extractEmailDataFlow',
    inputSchema: ExtractEmailDataInputSchema,
    outputSchema: ExtractEmailDataOutputSchema,
  },
  async input => {
    const {output} = await extractEmailDataPrompt(input);
    return output!;
  }
);
