
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagnoseWorkflowButton } from "../DiagnoseWorkflowButton";

interface WorkflowDiagnosticsProps {
  diagnosticResult: any;
  requestId: string;
  isDiagnosing: boolean;
  onDiagnose: () => Promise<any>;
  onFix: () => Promise<any>;
  onSuccess: () => Promise<void>;
  error?: Error | null;
}

export const WorkflowDiagnostics: React.FC<WorkflowDiagnosticsProps> = ({ 
  diagnosticResult, 
  requestId,
  isDiagnosing,
  onDiagnose,
  onFix,
  onSuccess,
  error
}) => {
  return (
    <div className="space-y-4">
      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            حدث خطأ أثناء تحميل بيانات سير العمل: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Diagnostic results display */}
      {diagnosticResult && !diagnosticResult.success && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {diagnosticResult.error || "هناك مشكلة في مسار سير العمل"}
            {diagnosticResult.debug_info && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer">عرض التفاصيل</summary>
                <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto rtl">{JSON.stringify(diagnosticResult.debug_info, null, 2)}</pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {diagnosticResult && diagnosticResult.success && diagnosticResult.issues && diagnosticResult.issues.length > 0 && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">تم اكتشاف مشاكل في مسار سير العمل:</div>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {diagnosticResult.issues.map((issue: string, index: number) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onFix} 
              className="mt-2"
            >
              إصلاح المشاكل
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <DiagnoseWorkflowButton 
        requestId={requestId} 
        onDiagnose={onDiagnose}
        onFix={onFix}
        onSuccess={onSuccess}
        isDiagnosing={isDiagnosing}
        diagnosticResult={diagnosticResult}
        className="w-full" 
      />
    </div>
  );
};
