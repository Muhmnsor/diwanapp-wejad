
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
      id: stepToEdit.id || null,
      workflow_id: stepToEdit.workflow_id || currentWorkflowId || 'temp-workflow-id',
      created_at: stepToEdit.created_at || null
    });
    setEditingStepIndex(stepIndex);
  };

  return { handleEditStep };
};
