
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Wrench, 
  AlertCircle 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DiagnoseWorkflowButtonProps {
  requestId: string;
  onDiagnose: () => Promise<any>;
  onFix: () => Promise<any>;
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
  const [isFixing, setIsFixing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleDiagnose = async () => {
    try {
      await onDiagnose();
      setIsDialogOpen(true);
    } catch (error) {
      toast.error(`فشل تشخيص سير العمل: ${error.message}`);
    }
  };
  
  const handleFix = async () => {
    try {
      setIsFixing(true);
      const result = await onFix();
      if (result?.success) {
        toast.success("تم إصلاح مشكلات سير العمل بنجاح");
        await onSuccess();
        setIsDialogOpen(false);
      } else {
        toast.error(`فشل إصلاح سير العمل: ${result?.message || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      toast.error(`فشل إصلاح سير العمل: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };
  
  // Helper to determine severity icon and color
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">عالية</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-amber-500">متوسطة</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-blue-500">منخفضة</Badge>;
      default:
        return <Badge variant="outline">غير محددة</Badge>;
    }
  };
  
  // Only show if we have diagnostic data with issues
  const hasIssues = diagnosticResult?.data?.has_issues;
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiagnose}
              disabled={isDiagnosing}
              className={className}
            >
              {isDiagnosing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasIssues ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <Wrench className="h-4 w-4" />
              )}
              <span className="mr-2">تشخيص</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>تشخيص وإصلاح مشكلات سير العمل</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>نتائج تشخيص سير العمل</DialogTitle>
            <DialogDescription>
              {hasIssues 
                ? `تم العثور على ${diagnosticResult?.data?.issues.length} مشكلة في سير العمل` 
                : "لم يتم العثور على مشكلات في سير العمل"}
            </DialogDescription>
          </DialogHeader>
          
          {hasIssues ? (
            <div className="space-y-4 max-h-96 overflow-y-auto py-2">
              {diagnosticResult?.data?.issues.map((issue: any, index: number) => (
                <Alert key={index} variant={issue.severity === 'high' ? 'destructive' : 'default'}>
                  {getSeverityIcon(issue.severity)}
                  <AlertTitle className="flex items-center gap-2">
                    مشكلة {getSeverityBadge(issue.severity)}
                  </AlertTitle>
                  <AlertDescription>
                    {issue.message}
                  </AlertDescription>
                </Alert>
              ))}
              
              {diagnosticResult?.data?.recommendations?.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">التوصيات:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnosticResult.data.recommendations.map((rec: any, index: number) => (
                      <li key={index} className="text-sm">{rec.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-center text-sm">سير العمل في حالة جيدة ولا توجد مشكلات تم اكتشافها.</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إغلاق
            </Button>
            {hasIssues && (
              <Button 
                onClick={handleFix} 
                disabled={isFixing}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isFixing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الإصلاح...
                  </>
                ) : (
                  <>إصلاح المشكلات</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

