
import React from "react";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = "typescript",
  className 
}) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code to clipboard:', error);
    }
  };
  
  return (
    <div className={cn("relative font-mono text-sm overflow-hidden rounded-lg border", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b">
        <div className="text-xs text-muted-foreground">
          {language === "typescript" ? "TypeScript" : 
           language === "javascript" ? "JavaScript" :
           language === "jsx" ? "JSX/TSX" :
           language === "css" ? "CSS" :
           language === "html" ? "HTML" :
           language === "sql" ? "SQL" : 
           language}
        </div>
        <button
          onClick={copyToClipboard}
          className="p-1 hover:bg-secondary rounded-md"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-secondary/10" dir="ltr">
        <code className="text-xs md:text-sm">
          {code}
        </code>
      </pre>
    </div>
  );
};
