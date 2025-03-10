
import { WorkflowStep } from "../../../types";

export const useEditStep = (
  setCurrentStep: (step: WorkflowStep) => void,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleEditStep = (
    index: number, 
    workflowSteps: WorkflowStep[],
    currentWorkflowId: string | null
  ) => {
    // Determine the correct workflow ID
    const workflowId = currentWorkflowId && currentWorkflowId !== 'temp-workflow-id' 
      ? currentWorkflowId 
      : workflowSteps.length > 0 && workflowSteps[0].workflow_id && workflowSteps[0].workflow_id !== 'temp-workflow-id'
        ? workflowSteps[0].workflow_id
        : 'temp-workflow-id';
    
    console.log(`Editing step at index ${index} with workflow ID:`, workflowId);
    
    // Ensure the step has the correct workflow ID
    const step = {
      ...workflowSteps[index],
      workflow_id: workflowId
    };
    
    setCurrentStep(step);
    setEditingStepIndex(index);
  };

  return { handleEditStep };
};
