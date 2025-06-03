
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
  agentOutput: z.record(z.any()).describe('The output from the document processing agent. This can include fields like urgency, tone, etc.'),
  intent: z.string().describe('The business intent of the document (e.g., RFQ, Complaint, Invoice).'),
  format: z.string().describe('The format of the document (e.g., JSON, Email, PDF).'),
});
export type RouteActionInput = z.infer<typeof RouteActionInputSchema>;

const RouteActionOutputSchema = z.object({
  actionTaken: z.string().describe('The action taken by the router (e.g., create_ticket, escalate_issue, flag_compliance_risk, log_and_close).'),
  details: z.string().describe('Details about the action taken, such as the ticket ID, risk details, or log confirmation.'),
});
export type RouteActionOutput = z.infer<typeof RouteActionOutputSchema>;

async function simulateRestCall(endpoint: string, data: any): Promise<string> {
  // Simulate a REST call, replace with actual API calls in production
  console.log(`Simulating REST call to ${endpoint} with data:`, data);
  // For 'log_and_close', agentOutput might be what we want to log.
  // For 'create_ticket', agentOutput could be the ticket content.
  return `Simulated ${endpoint} call. Data payload: ${JSON.stringify(data)}`;
}

export async function routeAction(input: RouteActionInput): Promise<RouteActionOutput> {
  return routeActionFlow(input);
}

// Define a schema for the prompt's specific input, including the stringified agentOutput
const RouteActionPromptInputSchema = RouteActionInputSchema.extend({
    agentOutputStringified: z.string().describe('The stringified JSON of the specialized agent output.')
});

const prompt = ai.definePrompt({
  name: 'routeActionPrompt',
  input: {
    schema: RouteActionPromptInputSchema, // Use the new schema for prompt input
  },
  output: {
    schema: RouteActionOutputSchema,
  },
  prompt: `You are an intelligent action router. Your task is to determine the most appropriate follow-up action based on the document's format, its business intent, and the output from a specialized processing agent.

Document Format: {{{format}}}
Business Intent: {{{intent}}}
Specialized Agent Output: {{{agentOutputStringified}}}

Consider the following when deciding the action:
- If the agent output (especially for emails) indicates low urgency and a polite or neutral tone for a routine inquiry (like a request for information, product specs, or a simple question), the action should be 'log_and_close'.
- If the agent output indicates high urgency, an escalation, or a threatening/angry tone, the action should usually be 'escalate_issue'.
- If the business intent is 'Complaint' and it's not already escalated by tone/urgency, 'create_ticket' might be appropriate for tracking.
- If the business intent is 'Fraud Risk' or 'Regulation' and the agent output flags something significant, 'flag_compliance_risk' is suitable.
- For general RFQs or standard invoices that don't meet other specific criteria, 'create_ticket' can be used for tracking.

Possible actions:
- 'log_and_close': For routine, low-priority items that just need to be recorded without requiring immediate follow-up.
- 'create_ticket': For items that need to be tracked and potentially worked on by a team member.
- 'escalate_issue': For urgent items or those with negative sentiment requiring immediate or specialized attention.
- 'flag_compliance_risk': For items related to regulatory concerns, potential fraud, or other compliance issues.

Return a JSON object with 'actionTaken' (one of the possible actions) and 'details'.
- For 'log_and_close', 'details' should confirm logging, e.g., "Logged routine inquiry. No further action required."
- For 'create_ticket', 'details' might include a simulated ticket ID or confirmation, e.g., "Ticket created for [summary of issue]."
- For 'escalate_issue', 'details' should reflect the escalation, e.g., "Issue escalated due to [reason]."
- For 'flag_compliance_risk', 'details' should describe the risk flagged, e.g., "Compliance risk flagged: [description of risk]."
`,
  // templateHelpers is no longer needed as we pre-stringify
});

const routeActionFlow = ai.defineFlow(
  {
    name: 'routeActionFlow',
    inputSchema: RouteActionInputSchema, // The flow's external input schema remains the same
    outputSchema: RouteActionOutputSchema,
  },
  async (flowInput: RouteActionInput) => { // Use flowInput to distinguish from prompt's input
    // Prepare the input for the prompt by stringifying agentOutput
    const promptInput = {
        ...flowInput,
        agentOutputStringified: JSON.stringify(flowInput.agentOutput),
    };
    
    const {output} = await prompt(promptInput); // Pass the prepared input to the prompt

    let endpoint = '';
    let actionDetails = output?.details ?? 'No specific details provided by AI.';
    const agentOutputForSimCall = flowInput.agentOutput; // Use the original agent output for the simulated call

    if (output?.actionTaken === 'create_ticket') {
      endpoint = '/crm/create_ticket';
      actionDetails = output.details || `Simulated ticket creation for intent: ${flowInput.intent}`;
    } else if (output?.actionTaken === 'escalate_issue') {
      endpoint = '/crm/escalate';
      actionDetails = output.details || `Simulated escalation for intent: ${flowInput.intent}`;
    } else if (output?.actionTaken === 'flag_compliance_risk') {
      endpoint = '/risk_alert/flag';
      actionDetails = output.details || `Simulated compliance risk flagging for intent: ${flowInput.intent}`;
    } else if (output?.actionTaken === 'log_and_close') {
      endpoint = '/crm/log_inquiry';
      actionDetails = output.details || `Simulated logging of routine inquiry for intent: ${flowInput.intent}`;
    } else {
      return {
        actionTaken: 'no_action_determined',
        details: `AI did not determine a specific action from the defined list. AI output: ${JSON.stringify(output)}`,
      };
    }

    const simulationResult = await simulateRestCall(endpoint, agentOutputForSimCall);

    // The AI should provide the details, but we have fallbacks.
    // We will prioritize AI's detail if available and append simulation result.
    let finalDetails = actionDetails;
    if (output?.details) { // If AI provided specific details as requested
        finalDetails = `${output.details}. ${simulationResult}`;
    } else { // Fallback if AI didn't provide details in the expected way
        finalDetails = `${actionDetails}. ${simulationResult}`;
    }


    return {
      actionTaken: output?.actionTaken ?? 'unknown_action_from_ai',
      details: finalDetails,
    };
  }
);
