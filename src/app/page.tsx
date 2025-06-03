'use client';

import { useState, type ReactNode } from 'react';
import Header from '@/components/app/header';
import InputForm, { type InputType } from '@/components/app/input-form';
import OutputCard from '@/components/app/output-card';
import MemoryLogDisplay, { type LogEntry } from '@/components/app/memory-log-display';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { fileToDataUri } from '@/lib/utils';

import { classifyDocument, type ClassifyDocumentInput, type ClassifyDocumentOutput } from '@/ai/flows/classify-document';
import { extractEmailData, type ExtractEmailDataInput, type ExtractEmailDataOutput } from '@/ai/flows/extract-email-data';
import { parseJsonWebhook, type ParseJsonWebhookInput, type ParseJsonWebhookOutput } from '@/ai/flows/parse-json-webhook';
import { extractPdfData, type ExtractPdfDataInput, type ExtractPdfDataOutput } from '@/ai/flows/extract-pdf-data';
import { routeAction, type RouteActionInput, type RouteActionOutput } from '@/ai/flows/route-action';

import {
  Mail, Braces, FileText, Filter, Route as RouteIcon, MessageCircleWarning, HelpCircle, Receipt, Gavel, ShieldAlert, Cog
} from 'lucide-react';

const App = () => {
  const [inputType, setInputType] = useState<InputType>('Email');
  const [inputValue, setInputValue] = useState<string>('');
  const [inputFile, setInputFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [classifierOutput, setClassifierOutput] = useState<ClassifyDocumentOutput | null>(null);
  const [classifierError, setClassifierError] = useState<string | null>(null);

  const [specializedAgentOutput, setSpecializedAgentOutput] = useState<ExtractEmailDataOutput | ParseJsonWebhookOutput | ExtractPdfDataOutput | null>(null);
  const [specializedAgentError, setSpecializedAgentError] = useState<string | null>(null);
  const [specializedAgentName, setSpecializedAgentName] = useState<string>('Specialized Agent');
  
  const [actionRouterOutput, setActionRouterOutput] = useState<RouteActionOutput | null>(null);
  const [actionRouterError, setActionRouterError] = useState<string | null>(null);

  const [memoryLog, setMemoryLog] = useState<LogEntry[]>([]);
  const { toast } = useToast();

  const addLogEntry = (logEntry: Partial<LogEntry> & { agent: string; output: any }) => {
    setMemoryLog(prev => [...prev, { timestamp: new Date().toISOString(), ...logEntry } as LogEntry]);
  };

  const resetOutputs = () => {
    setClassifierOutput(null);
    setClassifierError(null);
    setSpecializedAgentOutput(null);
    setSpecializedAgentError(null);
    setActionRouterOutput(null);
    setActionRouterError(null);
    // Optionally clear memory log: setMemoryLog([]);
  };

  const getIconForIntent = (intent?: string): ReactNode => {
    switch (intent) {
      case 'RFQ': return <HelpCircle className="h-5 w-5 text-primary" />;
      case 'Complaint': return <MessageCircleWarning className="h-5 w-5 text-primary" />;
      case 'Invoice': return <Receipt className="h-5 w-5 text-primary" />;
      case 'Regulation': return <Gavel className="h-5 w-5 text-primary" />;
      case 'Fraud Risk': return <ShieldAlert className="h-5 w-5 text-primary" />;
      default: return <Cog className="h-5 w-5 text-primary" />;
    }
  };
  
  const getIconForFormat = (format?: string): ReactNode => {
     switch (format) {
      case 'Email': return <Mail className="h-5 w-5 text-primary" />;
      case 'JSON': return <Braces className="h-5 w-5 text-primary" />;
      case 'PDF': return <FileText className="h-5 w-5 text-primary" />;
      default: return <Cog className="h-5 w-5 text-primary" />;
    }
  };


  const handleProcessRequest = async () => {
    setIsLoading(true);
    resetOutputs();

    let currentDocumentContent = inputValue;
    if (inputType === 'PDF' && inputFile) {
      try {
        currentDocumentContent = await fileToDataUri(inputFile);
      } catch (error) {
        toast({ title: "Error reading PDF", description: "Could not read the PDF file.", variant: "destructive" });
        setSpecializedAgentError("Failed to read PDF file.");
        setIsLoading(false);
        return;
      }
    } else if (inputType === 'PDF' && !inputFile) {
        toast({ title: "Missing PDF File", description: "Please select a PDF file to process.", variant: "destructive" });
        setIsLoading(false);
        return;
    } else if (inputType !== 'PDF' && !inputValue.trim()){
        toast({ title: "Missing Input", description: `Please provide content for ${inputType}.`, variant: "destructive" });
        setIsLoading(false);
        return;
    }


    // Step 1: Classifier Agent
    let classifiedIntent: string | undefined;
    let classifiedFormat: string | undefined;
    try {
      const classifierInput: ClassifyDocumentInput = { documentContent: inputType === 'PDF' ? `PDF File: ${inputFile?.name}` : inputValue, documentFormat: inputType };
      addLogEntry({ agent: "Classifier", input: classifierInput, output: "Processing..." });
      const output = await classifyDocument(classifierInput);
      setClassifierOutput(output);
      classifiedIntent = output.intent;
      classifiedFormat = output.format;
      addLogEntry({ agent: "Classifier", input: classifierInput, output });
      toast({ title: "Classifier Success", description: `Document classified as ${output.format} - ${output.intent}` });
    } catch (error: any) {
      setClassifierError(error.message || "Error in Classifier Agent");
      addLogEntry({ agent: "Classifier", output: { error: error.message } });
      toast({ title: "Classifier Error", description: error.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    // Step 2: Specialized Agent
    let agentOutputForRouter: any = null;
    if (classifiedFormat) {
      try {
        let specializedOutput;
        let specializedInput;
        if (classifiedFormat === 'Email') {
          setSpecializedAgentName('Email Agent');
          specializedInput = { emailContent: inputValue };
          addLogEntry({ agent: "Email Agent", input: specializedInput, output: "Processing..." });
          specializedOutput = await extractEmailData(specializedInput as ExtractEmailDataInput);
        } else if (classifiedFormat === 'JSON') {
          setSpecializedAgentName('JSON Agent');
          specializedInput = { webhookData: inputValue };
          addLogEntry({ agent: "JSON Agent", input: specializedInput, output: "Processing..." });
          specializedOutput = await parseJsonWebhook(specializedInput as ParseJsonWebhookInput);
        } else if (classifiedFormat === 'PDF') {
          setSpecializedAgentName('PDF Agent');
          specializedInput = { pdfDataUri: currentDocumentContent }; // currentDocumentContent is data URI here
          addLogEntry({ agent: "PDF Agent", input: { pdfFileName: inputFile?.name }, output: "Processing..." });
          specializedOutput = await extractPdfData(specializedInput as ExtractPdfDataInput);
        }
        setSpecializedAgentOutput(specializedOutput || null);
        agentOutputForRouter = specializedOutput;
        addLogEntry({ agent: specializedAgentName, input: specializedInput, output: specializedOutput });
        toast({ title: `${specializedAgentName} Success`, description: "Data extracted successfully." });
      } catch (error: any) {
        setSpecializedAgentError(error.message || `Error in ${specializedAgentName}`);
        addLogEntry({ agent: specializedAgentName, output: { error: error.message } });
        toast({ title: `${specializedAgentName} Error`, description: error.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }
    }

    // Step 3: Action Router
    if (agentOutputForRouter && classifiedIntent && classifiedFormat) {
      try {
        const routerInput: RouteActionInput = { agentOutput: agentOutputForRouter, intent: classifiedIntent, format: classifiedFormat };
        addLogEntry({ agent: "Action Router", input: routerInput, output: "Processing..." });
        const output = await routeAction(routerInput);
        setActionRouterOutput(output);
        addLogEntry({ agent: "Action Router", input: routerInput, output, action: `Action: ${output.actionTaken}` });
        toast({ title: "Action Router Success", description: `Action triggered: ${output.actionTaken}` });
      } catch (error: any) {
        setActionRouterError(error.message || "Error in Action Router");
        addLogEntry({ agent: "Action Router", output: { error: error.message } });
        toast({ title: "Action Router Error", description: error.message, variant: "destructive" });
      }
    }
    
    setIsLoading(false);
  };

  const currentSpecializedAgentIcon = getIconForFormat(classifierOutput?.format);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header appName="Context Chained AI Actions" />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
             <InputForm
              inputType={inputType}
              setInputType={setInputType}
              inputValue={inputValue}
              setInputValue={setInputValue}
              inputFile={inputFile}
              setInputFile={setInputFile}
              onSubmit={handleProcessRequest}
              isLoading={isLoading}
            />
          </div>

          <OutputCard
            title="Classifier Agent Output"
            description="Identifies document format and business intent."
            icon={<Filter className="h-5 w-5 text-primary" />}
            data={classifierOutput}
            isLoading={isLoading && !classifierOutput && !classifierError}
            error={classifierError}
          />
          
          <OutputCard
            title={`${specializedAgentName} Output`}
            description={`Extracts data specific to ${classifierOutput?.format || 'the document type'}.`}
            icon={currentSpecializedAgentIcon}
            data={specializedAgentOutput}
            isLoading={isLoading && !!classifierOutput && !specializedAgentOutput && !specializedAgentError}
            error={specializedAgentError}
          />

          <OutputCard
            title="Action Router Output"
            description="Determines and simulates follow-up actions."
            icon={<RouteIcon className="h-5 w-5 text-primary" />}
            data={actionRouterOutput}
            isLoading={isLoading && !!specializedAgentOutput && !actionRouterOutput && !actionRouterError}
            error={actionRouterError}
          />

          <div className="md:col-span-2">
            <MemoryLogDisplay logs={memoryLog} />
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t border-border">
        Context Chained AI Actions &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
