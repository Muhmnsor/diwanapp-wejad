
import React from 'react';
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock = ({ code, language = "typescript", className }: CodeBlockProps) => {
  return (
    <div className={cn("relative rounded-md bg-muted", className)}>
      <pre className="overflow-x-auto p-4 text-sm">
        <code className="text-xs md:text-sm">
          {code}
        </code>
      </pre>
      <div className="absolute top-3 right-3 text-xs font-mono text-muted-foreground bg-muted-foreground/20 px-2 py-0.5 rounded">
        {language}
      </div>
    </div>
  );
};
