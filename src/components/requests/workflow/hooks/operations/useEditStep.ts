
import { WorkflowStep } from "../../../types";

export const useEditStep = (
  setCurrentStep: (step: WorkflowStep) => void,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleEditStep = (stepIndex: number, workflowSteps: WorkflowStep[], currentWorkflowId: string | null) => {
    if (stepIndex < 0 || stepIndex >= workflowSteps.length) return;
    
    const stepToEdit = workflowSteps[stepIndex];
    setCurrentStep({
      ...stepToEdit,
      workflow_id: stepToEdit.workflow_id || currentWorkflowId || 'temp-workflow-id'
    });
    setEditingStepIndex(stepIndex);
  };

  return { handleEditStep };
};
