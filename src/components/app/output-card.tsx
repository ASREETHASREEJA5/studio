'use client';

import type { FC, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OutputCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  data: Record<string, any> | string | null;
  isLoading: boolean;
  error?: string | null;
}

const OutputCard: FC<OutputCardProps> = ({ title, description, icon, data, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </>
      );
    }
    if (error) {
      return (
        <div className="text-destructive flex items-start">
          <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
          <p className="font-code text-sm">{error}</p>
        </div>
      );
    }
    if (data === null || (typeof data === 'object' && Object.keys(data).length === 0) || data === "") {
      return <p className="text-muted-foreground italic">No data processed or available yet.</p>;
    }
    if (typeof data === 'string') {
      return <p className="text-sm whitespace-pre-wrap">{data}</p>;
    }
    return (
      <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-x-auto font-code">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Card className={`shadow-lg transition-all duration-300 ease-in-out ${isLoading ? 'animate-pulse-subtle' : ''}`}>
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default OutputCard;
