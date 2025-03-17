
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, Activity } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose: () => Promise<any>;
  onFix: () => Promise<any>;
  onSuccess: () => Promise<void>;
  isDiagnosing: boolean;
  diagnosticResult: any | null;
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
  const [isOpen, setIsOpen] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<any>(null);
  
  const runDiagnostic = async () => {
    try {
      await onDiagnose();
      if (!diagnosticResult?.issues?.length) {
        toast.success("لا توجد مشاكل في سير العمل");
      }
    } catch (error) {
      console.error("Error running diagnostic:", error);
      toast.error("حدث خطأ أثناء تشخيص سير العمل");
    }
  };
  
  const fixWorkflow = async () => {
    setIsFixing(true);
    setFixResult(null);
    
    try {
      const result = await onFix();
      setFixResult(result);
      
      if (result?.success) {
        toast.success("تم إصلاح سير العمل بنجاح");
        await onSuccess();
      } else {
        toast.error("فشل إصلاح سير العمل");
      }
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء إصلاح سير العمل");
    } finally {
      setIsFixing(false);
    }
  };
  
  const hasIssues = diagnosticResult?.issues?.length > 0;
  
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`flex gap-1 items-center ${className || ''}`}
      >
        <Activity className="h-4 w-4" />
        <span>تشخيص</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تشخيص مسار سير العمل</DialogTitle>
            <DialogDescription>
              يمكنك تشخيص وإصلاح المشاكل في مسار سير العمل للطلب
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex justify-between">
              <Button
                onClick={runDiagnostic}
                disabled={isDiagnosing}
                variant="outline"
              >
                {isDiagnosing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التشخيص...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    تشخيص المسار
                  </>
                )}
              </Button>
              
              {hasIssues && (
                <Button
                  onClick={fixWorkflow}
                  disabled={isFixing || !hasIssues}
                  variant="default"
                >
                  {isFixing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الإصلاح...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      إصلاح المشاكل
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {diagnosticResult && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">نتائج التشخيص:</h4>
                
                {diagnosticResult.issues?.length > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800">
                    <h5 className="font-medium mb-2">تم العثور على المشاكل التالية:</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {diagnosticResult.issues.map((issue: string, i: number) => (
                        <li key={i} className="text-sm">{issue}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-800">
                    <p>لا توجد مشاكل في مسار سير العمل</p>
                  </div>
                )}
                
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-800 text-sm mt-4">
                  <h5 className="font-medium mb-2">معلومات إضافية:</h5>
                  <ul className="space-y-1">
                    <li><span className="font-medium">رقم الطلب:</span> {requestId}</li>
                    <li><span className="font-medium">الحالة:</span> {diagnosticResult.status}</li>
                    <li><span className="font-medium">الخطوات المكتملة:</span> {diagnosticResult.debug_info?.approved_decision_steps || 0} من {diagnosticResult.debug_info?.total_decision_steps || 0}</li>
                  </ul>
                </div>
                
                {fixResult && (
                  <div className={`border rounded-md p-3 mt-4 ${
                    fixResult.success 
                      ? "bg-green-50 border-green-200 text-green-800" 
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}>
                    <h5 className="font-medium mb-2">نتيجة الإصلاح:</h5>
                    <p>{fixResult.result?.message || fixResult.message || "تم الإصلاح بنجاح"}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
