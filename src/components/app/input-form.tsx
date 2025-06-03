'use client';

import type { Dispatch, FC, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UploadCloud, FileText as FileIcon, Mail, Braces } from 'lucide-react'; // Renamed FileText to FileIcon

export type InputType = 'Email' | 'JSON' | 'PDF';

interface InputFormProps {
  inputType: InputType;
  setInputType: Dispatch<SetStateAction<InputType>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  inputFile: File | null;
  setInputFile: Dispatch<SetStateAction<File | null>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: FC<InputFormProps> = ({
  inputType,
  setInputType,
  inputValue,
  setInputValue,
  inputFile,
  setInputFile,
  onSubmit,
  isLoading,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setInputFile(event.target.files[0]);
    } else {
      setInputFile(null);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <UploadCloud className="mr-2 h-6 w-6 text-primary" />
          Provide Input Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={inputType} onValueChange={(value) => setInputType(value as InputType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="Email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Mail className="mr-2 h-4 w-4" /> Email
            </TabsTrigger>
            <TabsTrigger value="JSON" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Braces className="mr-2 h-4 w-4" /> JSON
            </TabsTrigger>
            <TabsTrigger value="PDF" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileIcon className="mr-2 h-4 w-4" /> PDF
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Email">
            <div className="space-y-2">
              <Label htmlFor="emailContent" className="font-semibold">Email Content</Label>
              <Textarea
                id="emailContent"
                placeholder="Paste email content here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={10}
                className="border-input focus:ring-primary"
              />
            </div>
          </TabsContent>
          <TabsContent value="JSON">
            <div className="space-y-2">
              <Label htmlFor="jsonContent" className="font-semibold">JSON Data</Label>
              <Textarea
                id="jsonContent"
                placeholder="Paste JSON data here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                rows={10}
                className="font-code border-input focus:ring-primary"
              />
            </div>
          </TabsContent>
          <TabsContent value="PDF">
            <div className="space-y-2">
              <Label htmlFor="pdfFile" className="font-semibold">PDF File</Label>
              <Input
                id="pdfFile"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="border-input focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {inputFile && (
                <p className="text-sm text-muted-foreground">Selected: {inputFile.name}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        <Button onClick={onSubmit} disabled={isLoading} className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          Process Input
        </Button>
      </CardContent>
    </Card>
  );
};

export default InputForm;
