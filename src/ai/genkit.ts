import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Attempt to use the GOOGLE_API_KEY from environment variables if available.
const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.warn(
    'GOOGLE_API_KEY is not set in the environment. Genkit will attempt to use application default credentials.'
  );
}

const googleAIPluginOptions = apiKey ? {apiKey} : {};

export const ai = genkit({
  plugins: [googleAI(googleAIPluginOptions)],
  // Using gemini-1.5-flash-latest as a more general and potentially more available model
  model: 'googleai/gemini-1.5-flash-latest',
});
