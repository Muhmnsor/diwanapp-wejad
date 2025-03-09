
import React, { useEffect } from "react";
import { WorkflowStep } from "./types";
import { StepForm } from "./workflow/StepForm";
import { StepsList } from "./workflow/StepsList";
import { useWorkflowSteps } from "./workflow/useWorkflowSteps";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WorkflowStepsConfigProps {
  requestTypeId: string | null;
  workflowId?: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[], workflowId: string | null) => void;
}

export const WorkflowStepsConfig = ({ 
  requestTypeId, 
  workflowId,
  onWorkflowStepsUpdated 
}: WorkflowStepsConfigProps) => {
  const {
    workflowSteps,
    currentStep,
    editingStepIndex,
    users,
    isLoading,
    error,
    workflowId: actualWorkflowId,
    setCurrentStep,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep,
  } = useWorkflowSteps({ 
    requestTypeId, 
    workflowId,
    onWorkflowStepsUpdated 
  });

  // Every time workflow steps or workflowId change, call the update function
  useEffect(() => {
    if (workflowSteps) {
      onWorkflowStepsUpdated(workflowSteps, actualWorkflowId);
    }
  }, [workflowSteps, actualWorkflowId, onWorkflowStepsUpdated]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">خطوات سير العمل</h3>
      </div>
      <Separator />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <StepForm
        currentStep={currentStep}
        editingStepIndex={editingStepIndex}
        users={users}
        isLoading={isLoading}
        onStepChange={setCurrentStep}
        onAddStep={handleAddStep}
      />
      
      <StepsList
        workflowSteps={workflowSteps}
        users={users}
        onMoveStep={handleMoveStep}
        onEditStep={handleEditStep}
        onRemoveStep={handleRemoveStep}
      />
    </div>
  );
};
