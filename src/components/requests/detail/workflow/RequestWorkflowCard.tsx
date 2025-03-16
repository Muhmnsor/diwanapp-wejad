
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCw, Activity, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { WorkflowCardProps } from "./types";
import { WorkflowStepsList } from "./WorkflowStepsList";
import { useWorkflowCardData } from "./useWorkflowCardData";
import { Progress } from "@/components/ui/progress";
import { DiagnoseWorkflowButton } from "./DiagnoseWorkflowButton";
import { CurrentStepDisplay } from "./CurrentStepDisplay";

export const RequestWorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  currentStep,
  requestId,
  requestStatus = 'pending'
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  const { 
    isLoading,
    error, 
    workflowSteps, 
    currentStepIndex,
    progressPercentage,
    diagnoseWorkflow,
    fixWorkflow,
    refreshWorkflowData
  } = useWorkflowCardData(requestId, workflow, currentStep, requestStatus);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshWorkflowData();
      toast.success("تم تحديث بيانات سير العمل");
    } catch (error) {
      console.error("Error refreshing workflow data:", error);
      toast.error("حدث خطأ أثناء تحديث البيانات");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDiagnoseWorkflow = async () => {
    setIsDiagnosing(true);
    try {
      const result = await diagnoseWorkflow();
      setDiagnosticResult(result);
      
      if (!result?.success) {
        toast.error("فشل تشخيص سير العمل: " + (result?.error || "خطأ غير معروف"));
      } else if (result.issues?.length === 0) {
        toast.success("لا توجد مشاكل في سير العمل");
      }
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص سير العمل");
    } finally {
      setIsDiagnosing(false);
    }
  };
  
  const handleFixWorkflow = async () => {
    try {
      const result = await fixWorkflow();
      console.log("Fix workflow result:", result);
      
      if (result?.success) {
        toast.success("تم إصلاح سير العمل بنجاح");
        refreshWorkflowData();
        setDiagnosticResult(null);
      } else {
        toast.error("فشل إصلاح سير العمل: " + (result?.error || "خطأ غير معروف"));
      }
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء إصلاح سير العمل");
    }
  };

  // Determine if the workflow is completed
  const isWorkflowCompleted = requestStatus === 'completed' || (currentStepIndex === -1 && workflowSteps.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">مسار سير العمل</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {workflow && (
          <div className="text-sm text-muted-foreground">
            {workflow.name}
            {workflow.description && (
              <p className="mt-1 text-xs">{workflow.description}</p>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2 space-y-4">
        {/* Progress indicator with improved styling */}
        {workflowSteps.length > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>التقدم في سير العمل</span>
              <span>
                {isWorkflowCompleted ? (
                  <span className="flex items-center text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    مكتمل
                  </span>
                ) : (
                  `${Math.round(progressPercentage)}%`
                )}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              indicatorClassName={
                progressPercentage >= 100 
                  ? "bg-green-500" 
                  : progressPercentage > 60 
                  ? "bg-blue-500" 
                  : "bg-primary"
              }
            />
          </div>
        )}
        
        <Separator className="my-3" />
        
        {/* Current step display */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">الخطوة الحالية</h4>
          <CurrentStepDisplay 
            currentStep={currentStep} 
            requestStatus={requestStatus}
            isLoading={isLoading} 
          />
        </div>
        
        <Separator className="my-3" />
        
        {/* All workflow steps with clearer visualization */}
        <div>
          <h4 className="text-sm font-medium mb-2">خطوات سير العمل</h4>
          <WorkflowStepsList 
            steps={workflowSteps}
            currentStepIndex={currentStepIndex}
            isLoading={isLoading}
            requestStatus={requestStatus}
          />
        </div>
        
        {/* Improved error display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              حدث خطأ أثناء تحميل بيانات سير العمل: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Better diagnostic results display */}
        {diagnosticResult && !diagnosticResult.success && (
          <Alert variant="warning" className="mt-4">
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
          <Alert variant="warning" className="mt-4">
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
                onClick={handleFixWorkflow} 
                className="mt-2"
              >
                إصلاح المشاكل
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <DiagnoseWorkflowButton 
          requestId={requestId} 
          onDiagnose={handleDiagnoseWorkflow}
          onFix={handleFixWorkflow}
          onSuccess={refreshWorkflowData}
          isDiagnosing={isDiagnosing}
          diagnosticResult={diagnosticResult}
          className="w-full" 
        />
      </CardFooter>
    </Card>
  );
};
