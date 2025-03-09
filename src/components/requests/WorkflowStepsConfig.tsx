
import React from "react";
import { WorkflowStep } from "./types";
import { StepForm } from "./workflow/StepForm";
import { StepsList } from "./workflow/StepsList";
import { useWorkflowSteps } from "./workflow/useWorkflowSteps";
import { Separator } from "@/components/ui/separator";

interface WorkflowStepsConfigProps {
  requestTypeId: string | null;
  workflowId?: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[]) => void;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">خطوات سير العمل</h3>
      </div>
      <Separator />
      
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
