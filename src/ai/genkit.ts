import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Attempt to use the GOOGLE_API_KEY from environment variables if available.
const apiKey = process.env.GOOGLE_API_KEY;
const googleAIPluginOptions = apiKey ? {apiKey} : {};

export const ai = genkit({
  plugins: [googleAI(googleAIPluginOptions)],
  model: 'googleai/gemini-2.0-flash',
});
