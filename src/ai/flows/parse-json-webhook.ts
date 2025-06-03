'use server';

/**
 * @fileOverview Parses JSON webhook data, validates it against a schema, and flags anomalies.
 *
 * - parseJsonWebhook - A function that handles the JSON webhook parsing and validation process.
 * - ParseJsonWebhookInput - The input type for the parseJsonWebhook function.
 * - ParseJsonWebhookOutput - The return type for the parseJsonWebhook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for the expected JSON webhook data
const JsonWebhookDataSchema = z.object({
  event_type: z.string().describe('The type of event.'),
  timestamp: z.string().describe('The timestamp of the event.'),
  data: z.record(z.any()).describe('The data associated with the event.'),
});

const ParseJsonWebhookInputSchema = z.object({
  webhookData: z.string().describe('The JSON webhook data as a string.'),
});
export type ParseJsonWebhookInput = z.infer<typeof ParseJsonWebhookInputSchema>;

const ParseJsonWebhookOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the JSON data is valid according to the schema.'),
  anomalies: z.array(z.string()).describe('A list of anomalies or errors found in the data.'),
});
export type ParseJsonWebhookOutput = z.infer<typeof ParseJsonWebhookOutputSchema>;

export async function parseJsonWebhook(input: ParseJsonWebhookInput): Promise<ParseJsonWebhookOutput> {
  return parseJsonWebhookFlow(input);
}

const parseJsonWebhookPrompt = ai.definePrompt({
  name: 'parseJsonWebhookPrompt',
  input: {schema: ParseJsonWebhookInputSchema},
  output: {schema: ParseJsonWebhookOutputSchema},
  prompt: `You are an expert system for validating JSON webhook data and identifying anomalies.

  Your task is to take the provided JSON webhook data, validate it against the expected schema, and flag any anomalies or errors.

  Here is the JSON Webhook Data:
  {{webhookData}}

  Return a JSON object indicating whether the data is valid and listing any anomalies found.
  `,
});

const parseJsonWebhookFlow = ai.defineFlow(
  {
    name: 'parseJsonWebhookFlow',
    inputSchema: ParseJsonWebhookInputSchema,
    outputSchema: ParseJsonWebhookOutputSchema,
  },
  async input => {
    try {
      // Parse the JSON data
      const webhookData = JSON.parse(input.webhookData);

      // Validate the data against the schema
      JsonWebhookDataSchema.parse(webhookData);

      // If no errors, return a success response
      return {
        isValid: true,
        anomalies: [],
      };
    } catch (error: any) {
      // If there are errors, return an error response with anomaly descriptions
      return {
        isValid: false,
        anomalies: [error.message],
      };
    }
  }
);
