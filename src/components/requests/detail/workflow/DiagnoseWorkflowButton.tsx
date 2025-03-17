
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, AlertTriangle, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose: () => Promise<{ success: boolean }>;
  onFix: () => Promise<{ success: boolean }>;
  onSuccess: () => Promise<void>;
  isDiagnosing: boolean;
  diagnosticResult: any;
  className?: string;
}

export const DiagnoseWorkflowButton = ({
  requestId,
  onDiagnose,
  onFix,
  onSuccess,
  isDiagnosing,
  diagnosticResult,
  className
}: DiagnoseWorkflowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const handleDiagnose = async () => {
    try {
      const result = await onDiagnose();
      if (result.success) {
        toast.success("تم تشخيص سير العمل بنجاح");
      }
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص سير العمل");
    }
  };

  const handleFix = async () => {
    try {
      setIsFixing(true);
      const result = await onFix();
      if (result.success) {
        toast.success("تم إصلاح سير العمل بنجاح");
        await onSuccess();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء إصلاح سير العمل");
    } finally {
      setIsFixing(false);
    }
  };

  // If no diagnostic result yet, show diagnose button
  if (!diagnosticResult) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDiagnose}
        disabled={isDiagnosing}
        className={className}
      >
        {isDiagnosing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            جاري التشخيص...
          </>
        ) : (
          <>
            <Settings className="h-4 w-4 mr-2" />
            تشخيص سير العمل
          </>
        )}
      </Button>
    );
  }

  // If there are issues, show fix button
  const hasIssues = diagnosticResult?.issues && diagnosticResult.issues.length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={hasIssues ? "destructive" : "outline"}
          size="sm"
          className={className}
        >
          {hasIssues ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              مشاكل في سير العمل
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              سير العمل سليم
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      {hasIssues && (
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="font-semibold">تم اكتشاف المشاكل التالية:</div>
            <ul className="space-y-2 list-disc list-inside">
              {diagnosticResult.issues.map((issue: any, index: number) => (
                <li key={index} className="text-sm">{issue.message}</li>
              ))}
            </ul>
            <Button
              onClick={handleFix}
              className="w-full"
              disabled={isFixing}
            >
              {isFixing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإصلاح...
                </>
              ) : (
                "إصلاح المشاكل"
              )}
            </Button>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};
