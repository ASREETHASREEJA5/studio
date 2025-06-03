'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Database, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export interface LogEntry {
  timestamp: string;
  agent: string;
  input?: any;
  output: any;
  action?: string;
}

interface MemoryLogDisplayProps {
  logs: LogEntry[];
}

const MemoryLogDisplay: FC<MemoryLogDisplayProps> = ({ logs }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          <Database className="mr-2 h-6 w-6 text-primary" />
          Shared Memory Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-muted-foreground italic">No log entries yet. Process an input to see logs.</p>
        ) : (
          <ScrollArea className="h-[400px] w-full pr-4">
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="p-3 border rounded-md bg-card/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary" className="font-semibold">{log.agent}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss.SSS")}
                    </span>
                  </div>
                  {log.input && (
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-muted-foreground">Input:</h4>
                      <pre className="bg-muted/30 p-2 rounded-md text-xs overflow-x-auto font-code max-h-32">
                        {typeof log.input === 'string' ? log.input : JSON.stringify(log.input, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="mt-2">
                     <h4 className="text-sm font-medium mb-1 text-primary">Output:</h4>
                    <pre className="bg-primary/10 p-2 rounded-md text-xs overflow-x-auto font-code max-h-32">
                      {typeof log.output === 'string' ? log.output : JSON.stringify(log.output, null, 2)}
                    </pre>
                  </div>

                  {log.action && (
                    <div className="mt-2 flex items-center text-accent">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      <span className="text-sm font-semibold">{log.action}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryLogDisplay;
