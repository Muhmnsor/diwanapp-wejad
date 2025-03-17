
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Stethoscope, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DiagnosticResult {
  isValid: boolean;
  issues: string[];
}

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose: () => Promise<DiagnosticResult>;
  onFix: () => Promise<void>;
  onSuccess: () => Promise<void>;
  isDiagnosing: boolean;
  diagnosticResult?: DiagnosticResult | null;
  className?: string;
}

export const DiagnoseWorkflowButton: React.FC<DiagnoseWorkflowButtonProps> = ({
  requestId,
  onDiagnose,
  onFix,
  onSuccess,
  isDiagnosing,
  diagnosticResult,
  className
}) => {
  const [isFixing, setIsFixing] = useState(false);
  
  const handleFix = async () => {
    if (!diagnosticResult || diagnosticResult.isValid) return;
    
    try {
      setIsFixing(true);
      await onFix();
      await onSuccess();
      toast.success("تم إصلاح مشاكل سير العمل بنجاح");
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء محاولة إصلاح سير العمل");
    } finally {
      setIsFixing(false);
    }
  };

  // If there's no diagnostic result yet, show the diagnose button
  if (!diagnosticResult) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDiagnose}
              disabled={isDiagnosing}
              className={cn("gap-1", className)}
            >
              {isDiagnosing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Stethoscope className="h-4 w-4" />
              )}
              <span className="hidden md:inline">فحص سير العمل</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>فحص سير العمل للتأكد من صحته</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If diagnostic result shows the workflow is valid
  if (diagnosticResult.isValid) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline"
              size="sm"
              className={cn("gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800", className)}
              onClick={onDiagnose}
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden md:inline">سير العمل صحيح</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تم التحقق من سير العمل وهو صحيح</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If there are issues with the workflow
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="outline"
            size="sm"
            className={cn("gap-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800", className)}
            onClick={handleFix}
            disabled={isFixing}
          >
            {isFixing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="hidden md:inline">إصلاح المشاكل ({diagnosticResult.issues.length})</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-bold">المشاكل المكتشفة:</p>
          <ul className="list-disc text-xs mt-1 mr-4">
            {diagnosticResult.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
