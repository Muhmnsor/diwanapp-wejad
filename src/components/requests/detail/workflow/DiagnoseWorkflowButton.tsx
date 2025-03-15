
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { debugWorkflowStatus, fixRequestWorkflow } from "../../workflow/utils/workflowDebugger";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onSuccess?: () => void;
  onDiagnose?: (result: any) => Promise<any>;
  onFix?: (result: any) => Promise<any>;
  className?: string;
  isDiagnosing?: boolean;
  diagnosticResult?: any;
}

export const DiagnoseWorkflowButton: React.FC<DiagnoseWorkflowButtonProps> = ({
  requestId,
  onSuccess,
  onDiagnose,
  onFix,
  className = "",
  isDiagnosing: externalIsDiagnosing,
  diagnosticResult: externalDiagnosticResult
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [internalIsDiagnosing, setInternalIsDiagnosing] = useState(false);
  const [internalDiagnosticResult, setInternalDiagnosticResult] = useState<any>(null);
  
  // Use either external or internal state
  const isDiagnosing = externalIsDiagnosing !== undefined ? externalIsDiagnosing : internalIsDiagnosing;
  const diagnosticResult = externalDiagnosticResult || internalDiagnosticResult;
  
  // Handle diagnostic process
  const handleDiagnose = async () => {
    if (!requestId) return;
    
    setInternalIsDiagnosing(true);
    try {
      // Use external handler if provided, otherwise use internal implementation
      let result;
      if (onDiagnose) {
        result = await onDiagnose(requestId);
      } else {
        result = await debugWorkflowStatus(requestId);
      }
      
      setInternalDiagnosticResult(result);
      setIsOpen(true);
      
      return result;
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص مسار العمل");
    } finally {
      setInternalIsDiagnosing(false);
    }
  };
  
  // Handle workflow fixing
  const handleFix = async () => {
    if (!requestId) return;
    
    setIsFixing(true);
    try {
      // Use external handler if provided, otherwise use internal implementation
      let result;
      if (onFix) {
        result = await onFix(requestId);
      } else {
        result = await fixRequestWorkflow(requestId);
      }
      
      if (result.success) {
        toast.success("تم إصلاح مسار العمل بنجاح");
        setIsOpen(false);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.error || "فشل إصلاح مسار العمل");
      }
      
      return result;
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء محاولة إصلاح مسار العمل");
    } finally {
      setIsFixing(false);
    }
  };
  
  // Determine if there are issues to fix
  const hasFixableIssues = diagnosticResult?.issues?.length > 0 || 
                          diagnosticResult?.canFix ||
                          diagnosticResult?.analysis?.issues?.length > 0;
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDiagnose}
        disabled={isDiagnosing}
        className={className}
      >
        {isDiagnosing ? (
          <>
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            جاري التشخيص...
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 ml-2" />
            تشخيص مسار العمل
          </>
        )}
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تشخيص مسار العمل</DialogTitle>
            <DialogDescription>
              {hasFixableIssues
                ? "تم اكتشاف مشاكل في مسار العمل. يمكنك إصلاحها تلقائيًا."
                : "لم يتم اكتشاف أي مشاكل في مسار العمل."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {hasFixableIssues && (
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {(diagnosticResult?.issues || diagnosticResult?.analysis?.issues || []).map((issue: string, i: number) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {!hasFixableIssues && (
              <Alert variant="default">
                <CheckSquare className="h-4 w-4" />
                <AlertDescription>
                  مسار العمل في حالة جيدة. لا توجد مشاكل تحتاج للإصلاح.
                </AlertDescription>
              </Alert>
            )}
            
            {diagnosticResult && (
              <details className="mt-4">
                <summary className="text-xs cursor-pointer text-muted-foreground">
                  عرض تفاصيل التشخيص
                </summary>
                <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(diagnosticResult, null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          <DialogFooter>
            {hasFixableIssues && (
              <Button onClick={handleFix} disabled={isFixing}>
                {isFixing ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الإصلاح...
                  </>
                ) : (
                  "إصلاح المشاكل"
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
