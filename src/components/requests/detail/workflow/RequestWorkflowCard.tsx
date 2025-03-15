
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCw, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { WorkflowCardProps } from "./types";
import { CurrentStepDisplay } from "./CurrentStepDisplay";
import { WorkflowStepsList } from "./WorkflowStepsList";
import { useWorkflowCardData } from "./useWorkflowCardData";
import { Progress } from "@/components/ui/progress";

export const RequestWorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  currentStep,
  requestId
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  
  const { 
    isLoading,
    error, 
    workflowSteps, 
    currentStepIndex,
    diagnoseWorkflow,
    refreshWorkflowData
  } = useWorkflowCardData(requestId, workflow, currentStep);

  // Calculate progress percentage
  const progressPercentage = workflowSteps.length > 0
    ? ((currentStepIndex === -1 ? workflowSteps.length : currentStepIndex) / workflowSteps.length) * 100
    : 0;

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

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const result = await diagnoseWorkflow();
      setDiagnosticResult(result);
      
      if (result?.success) {
        toast.success("تم فحص مسار العمل بنجاح");
      } else {
        toast.error("تم العثور على مشاكل في مسار العمل");
      }
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص مسار العمل");
    } finally {
      setIsDiagnosing(false);
    }
  };

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
        {/* Progress indicator */}
        {workflowSteps.length > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>التقدم في سير العمل</span>
              <span>{Math.round(progressPercentage)}%</span>
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

        {/* Current step */}
        <CurrentStepDisplay 
          currentStep={currentStep} 
          isLoading={isLoading} 
        />
        
        <Separator className="my-3" />
        
        {/* All workflow steps */}
        <div>
          <h4 className="text-sm font-medium mb-2">خطوات سير العمل</h4>
          <WorkflowStepsList 
            steps={workflowSteps}
            currentStepIndex={currentStepIndex}
            isLoading={isLoading}
          />
        </div>
        
        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              حدث خطأ أثناء تحميل بيانات سير العمل: {error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Diagnostic results */}
        {diagnosticResult && !diagnosticResult.success && (
          <Alert variant="warning" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {diagnosticResult.error || "هناك مشكلة في مسار سير العمل"}
              {diagnosticResult.debug_info && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">عرض التفاصيل</summary>
                  <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">{JSON.stringify(diagnosticResult.debug_info, null, 2)}</pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={handleDiagnose}
          disabled={isDiagnosing || !requestId}
        >
          <Activity className={`h-4 w-4 mr-2 ${isDiagnosing ? 'animate-pulse' : ''}`} />
          تشخيص مسار العمل
        </Button>
      </CardFooter>
    </Card>
  );
};
