import { WorkflowStep } from "../../../types";
import { toast } from "sonner";
import { isValidUUID } from "../utils/validation";

export const useEditStep = (
  setCurrentStep: (step: WorkflowStep) => void,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleEditStep = (
    index: number, 
    workflowSteps: WorkflowStep[],
    currentWorkflowId: string | null
  ) => {
    try {
      // Get the step to be edited
      if (index < 0 || index >= workflowSteps.length) {
        throw new Error("Invalid step index");
      }
      
      // Determine the correct workflow ID with validation
      let workflowId = 'temp-workflow-id';
      
      // First try to use the provided workflow ID
      if (currentWorkflowId && currentWorkflowId !== 'temp-workflow-id' && isValidUUID(currentWorkflowId)) {
        workflowId = currentWorkflowId;
        console.log(`Using provided workflow ID: ${workflowId}`);
      } 
      // Otherwise check if the steps have a valid workflow ID
      else if (workflowSteps.length > 0 && 
               workflowSteps[0].workflow_id && 
               workflowSteps[0].workflow_id !== 'temp-workflow-id' &&
               isValidUUID(workflowSteps[0].workflow_id)) {
        workflowId = workflowSteps[0].workflow_id;
        console.log(`Using workflow ID from steps: ${workflowId}`);
      } else {
        console.log(`Using temporary workflow ID: ${workflowId}`);
      }
      
      console.log(`Editing step at index ${index} with workflow ID:`, workflowId);
      
      // Ensure the step has the correct workflow ID
      const step = {
        ...workflowSteps[index],
        workflow_id: workflowId
      };
      
      setCurrentStep(step);
      setEditingStepIndex(index);
    } catch (error) {
      console.error("Error editing step:", error);
      toast.error(error.message || "حدث خطأ أثناء محاولة تعديل الخطوة");
    }
  };

  return { handleEditStep };
};
