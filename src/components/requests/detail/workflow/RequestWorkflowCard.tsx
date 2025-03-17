
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Workflow, WorkflowStep } from "../../types";
import { useWorkflowCardData } from "./useWorkflowCardData";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorkflowStepsList } from "./WorkflowStepsList";

interface RequestWorkflowCardProps {
  workflow?: Workflow;
  currentStep?: WorkflowStep;
  requestId: string;
  requestStatus?: string;
  workflowSteps?: WorkflowStep[];
}

export const RequestWorkflowCard = ({ 
  workflow, 
  currentStep, 
  requestId,
  requestStatus = 'pending',
  workflowSteps: initialWorkflowSteps = []
}: RequestWorkflowCardProps) => {
  const {
    isLoading,
    error,
    workflowSteps,
    currentStepIndex,
    progressPercentage
  } = useWorkflowCardData(
    workflow?.id,
    requestId,
    currentStep?.id
  );
  
  // Determine if request is completed
  const isCompleted = requestStatus === 'approved' || requestStatus === 'completed';
  
  // Use either the fetched workflow steps or the provided ones
  const displaySteps = workflowSteps.length > 0 ? workflowSteps : initialWorkflowSteps;
    
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>مسار سير العمل</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>مسار سير العمل</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              حدث خطأ أثناء تحميل معلومات سير العمل: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>مسار سير العمل</CardTitle>
        <div className="pt-2">
          <div className="flex justify-between mb-1 text-xs text-muted-foreground">
            <span>التقدم</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        {displaySteps.length > 0 ? (
          <WorkflowStepsList 
            steps={displaySteps} 
            currentStepIndex={currentStepIndex} 
            isCompleted={isCompleted}
          />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            لا توجد خطوات محددة لهذا الطلب
          </div>
        )}
      </CardContent>
    </Card>
  );
};
