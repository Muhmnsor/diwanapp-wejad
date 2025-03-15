
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertCircle, 
  Wrench, 
  Loader2, 
  CheckCircle 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onSuccess?: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'link' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const DiagnoseWorkflowButton: React.FC<DiagnoseWorkflowButtonProps> = ({
  requestId,
  onSuccess,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [showFixDialog, setShowFixDialog] = useState(false);
  
  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    
    try {
      // Call the diagnose-workflow-issues function
      const { data, error } = await supabase.functions.invoke('diagnose-workflow-issues', {
        body: { requestId }
      });
      
      if (error) {
        console.error("Error diagnosing workflow:", error);
        toast.error("حدث خطأ أثناء تشخيص مسار العمل");
        return;
      }
      
      setDiagnosticResult(data);
      
      if (data?.diagnose?.needs_fixing) {
        toast.warning("تم اكتشاف مشاكل في مسار العمل، يمكنك إصلاحها الآن");
        setShowFixDialog(true);
      } else {
        toast.success("تم فحص مسار العمل بنجاح، لم يتم العثور على مشاكل");
      }
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص مسار العمل");
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  const handleFix = async () => {
    setIsFixing(true);
    
    try {
      // Call the fix-request-status function
      const { data, error } = await supabase.functions.invoke('fix-request-status', {
        body: { requestId }
      });
      
      if (error) {
        console.error("Error fixing workflow:", error);
        toast.error("حدث خطأ أثناء محاولة إصلاح مسار العمل");
        return;
      }
      
      toast.success("تم إصلاح مسار العمل بنجاح");
      setShowFixDialog(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء محاولة إصلاح مسار العمل");
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleDiagnose}
        disabled={isDiagnosing}
      >
        {isDiagnosing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <AlertCircle className="h-4 w-4 mr-2" />
        )}
        تشخيص مسار العمل
      </Button>
      
      <AlertDialog open={showFixDialog} onOpenChange={setShowFixDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إصلاح مسار العمل</AlertDialogTitle>
            <AlertDialogDescription>
              تم اكتشاف مشاكل في مسار العمل للطلب. هل ترغب في إصلاحها الآن؟
              
              {diagnosticResult && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                  <p className="font-semibold mb-2">المشاكل المكتشفة:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {diagnosticResult.diagnose.issues?.map((issue: string, idx: number) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleFix} disabled={isFixing}>
              {isFixing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإصلاح...
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  إصلاح الآن
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
