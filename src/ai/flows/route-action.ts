// src/ai/flows/route-action.ts
'use server';

/**
 * @fileOverview This flow determines and triggers a follow-up action based on the outputs from other document processing agents.
 *
 * - routeAction - A function that routes actions based on agent outputs.
 * - RouteActionInput - The input type for the routeAction function.
 * - RouteActionOutput - The return type for the routeAction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RouteActionInputSchema = z.object({
  agentOutput: z.record(z.any()).describe('The output from the document processing agent.'),
  intent: z.string().describe('The business intent of the document (e.g., RFQ, Complaint, Invoice).'),
  format: z.string().describe('The format of the document (e.g., JSON, Email, PDF).'),
});
export type RouteActionInput = z.infer<typeof RouteActionInputSchema>;

const RouteActionOutputSchema = z.object({
  actionTaken: z.string().describe('The action taken by the router (e.g., create_ticket, escalate_issue, flag_compliance_risk).'),
  details: z.string().describe('Details about the action taken, such as the ticket ID or risk details.'),
});
export type RouteActionOutput = z.infer<typeof RouteActionOutputSchema>;

async function simulateRestCall(endpoint: string, data: any): Promise<string> {
  // Simulate a REST call, replace with actual API calls in production
  console.log(`Simulating REST call to ${endpoint} with data:`, data);
  return `Simulated ${endpoint} call with data: ${JSON.stringify(data)}`;
}

export async function routeAction(input: RouteActionInput): Promise<RouteActionOutput> {
  return routeActionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'routeActionPrompt',
  input: {
    schema: RouteActionInputSchema,
  },
  output: {
    schema: RouteActionOutputSchema,
  },
  prompt: `Given the output from a document processing agent, determine the appropriate follow-up action.

Document Format: {{{format}}}
Business Intent: {{{intent}}}
Agent Output: {{{agentOutput}}}

Based on the above information, what action should be taken? Possible actions include: create_ticket, escalate_issue, flag_compliance_risk.

Return a JSON object with the actionTaken and details. The actionTaken field should be one of the possible actions.
The details field should include any relevant information about the action, such as a ticket ID or risk details.
`,
});

const routeActionFlow = ai.defineFlow(
  {
    name: 'routeActionFlow',
    inputSchema: RouteActionInputSchema,
    outputSchema: RouteActionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Simulate triggering the action via a REST call
    let endpoint = '';
    if (output?.actionTaken === 'create_ticket') {
      endpoint = '/crm/create_ticket';
    } else if (output?.actionTaken === 'escalate_issue') {
      endpoint = '/crm/escalate';
    } else if (output?.actionTaken === 'flag_compliance_risk') {
      endpoint = '/risk_alert';
    } else {
      return {
        actionTaken: 'no_action_taken',
        details: 'No action was taken as no route matched.',
      };
    }

    const result = await simulateRestCall(endpoint, input.agentOutput);

    return {
      actionTaken: output?.actionTaken ?? 'unknown',
      details: result,
    };
  }
);
