
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  onDiagnose: () => Promise<any>;
  onFix: () => Promise<any>;
  onSuccess?: () => void;
  isDiagnosing?: boolean;
  diagnosticResult?: any;
  variant?: 'default' | 'outline' | 'destructive' | 'link' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const DiagnoseWorkflowButton: React.FC<DiagnoseWorkflowButtonProps> = ({
  requestId,
  onDiagnose,
  onFix,
  onSuccess,
  isDiagnosing = false,
  diagnosticResult = null,
  variant = 'outline',
  size = 'sm',
  className = ''
}) => {
  const [isFixing, setIsFixing] = useState(false);
  const [showFixDialog, setShowFixDialog] = useState(false);
  
  const handleDiagnose = async () => {
    try {
      const result = await onDiagnose();
      
      if (result?.diagnose?.needs_fixing) {
        setShowFixDialog(true);
      }
    } catch (error) {
      console.error("Error in diagnosis handler:", error);
    }
  };
  
  const handleFix = async () => {
    setIsFixing(true);
    
    try {
      await onFix();
      setShowFixDialog(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error in fix handler:", error);
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
