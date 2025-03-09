
import React from "react";
import { WorkflowStep } from "./types";
import { StepForm } from "./workflow/StepForm";
import { StepsList } from "./workflow/StepsList";
import { useWorkflowSteps } from "./workflow/useWorkflowSteps";

interface WorkflowStepsConfigProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated: (steps: WorkflowStep[]) => void;
}

export const WorkflowStepsConfig = ({ 
  requestTypeId, 
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
  } = useWorkflowSteps({ requestTypeId, onWorkflowStepsUpdated });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">إعداد خطوات سير العمل</h3>
      
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
