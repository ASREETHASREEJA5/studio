import { config } from 'dotenv';
config();

import '@/ai/flows/route-action.ts';
import '@/ai/flows/classify-document.ts';
import '@/ai/flows/extract-pdf-data.ts';
import '@/ai/flows/extract-email-data.ts';
import '@/ai/flows/parse-json-webhook.ts';