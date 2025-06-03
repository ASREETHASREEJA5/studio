# **App Name**: Context Chained AI Actions

## Core Features:

- Format and Intent Classification: Classifier agent determines the format (Email, JSON, PDF) and business intent (RFQ, Complaint, Invoice, Regulation, Fraud Risk) using few-shot examples and schema matching.
- Email Processing: Email agent extracts structured fields (sender, urgency, issue/request) and identifies the tone (escalation, polite, threatening). Based on tone and urgency, appropriate actions are triggered using a tool to escalate or log the issue.
- JSON Parsing and Validation: JSON agent parses webhook data, validates required schema fields, and flags anomalies. Alerts are logged if any issues are detected, leveraging generative AI as a tool for anomaly flagging.
- PDF Content Extraction and Flagging: PDF agent extracts fields, parses invoice line-item data, and checks policy documents, using generative AI as a tool to detect specific issues such as high invoice totals or regulatory mentions (GDPR, FDA, etc.).
- Shared Memory Store: A shared memory store enables all agents to read and write input metadata, extracted fields, chained actions, and agent decision traces, facilitating comprehensive audit trails and data sharing.
- Action Router: Action router triggers follow-up actions based on agent outputs, simulating actions such as creating a ticket or flagging a compliance risk, controlled by generative AI with reasoning.

## Style Guidelines:

- Primary color: Saturated teal (#4db6ac) for a professional yet approachable feel.
- Background color: Light grey (#f0f4c4) for a clean and neutral base.
- Accent color: Warm gold (#e6b800) for highlighting important alerts and actions.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, technical feel. Body font: 'Inter' (sans-serif) for readability. Code font: 'Source Code Pro' (monospace) for any displayed code.
- Grid-based layout with clear sections for input display, agent outputs, and action logs.
- Consistent use of recognizable icons for each format and intent type.
- Subtle animations on data processing and action triggering.