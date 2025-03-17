
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
import { WorkflowDiagnosticButton } from "./WorkflowDiagnosticButton";

export const RequestWorkflowCard: React.FC<WorkflowCardProps> = ({ 
  workflow, 
  currentStep,
  requestId,
  requestStatus = 'pending'
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  // Determine if the workflow is completed
  const isWorkflowCompleted = requestStatus === 'completed' || (currentStepIndex === -1 && workflowSteps.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">مسار سير العمل</CardTitle>
          <div className="flex items-center gap-2">
            <WorkflowDiagnosticButton 
              requestId={requestId}
              onRunDiagnostic={diagnoseWorkflow}
              onFixWorkflow={fixWorkflow}
              refreshData={refreshWorkflowData}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
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
      </CardContent>
    </Card>
  );
};
