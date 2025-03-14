import { WorkflowStep } from "../../../types";
import { toast } from "sonner";
import { getInitialStepState } from "../../utils";
import { isValidUUID } from "../utils/validation";

export const useRemoveStep = (
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>,
  setCurrentStep: (step: WorkflowStep) => void,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleRemoveStep = async (
    index: number, 
    workflowSteps: WorkflowStep[], 
    editingStepIndex: number | null,
    currentWorkflowId: string | null
  ) => {
    try {
      // Validate inputs
      if (index < 0 || index >= workflowSteps.length) {
        throw new Error("خطأ: الخطوة المطلوبة غير موجودة");
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
      
      console.log(`Removing step at index ${index} with workflow ID:`, workflowId);
      
      // If we're removing the step that's currently being edited, reset the editing state
      if (editingStepIndex === index) {
        setCurrentStep(getInitialStepState(1, workflowId));
        setEditingStepIndex(null);
      }

      // Remove the step
      const updatedSteps = workflowSteps.filter((_, i) => i !== index);

      // Update step order in remaining steps if there are any
      const reorderedSteps = updatedSteps.map((step, i) => ({
        ...step,
        step_order: i + 1,
        workflow_id: workflowId // Ensure consistent workflow ID
      }));

      // Always save the changes to the database, even if the result is an empty array
      // This ensures the database is in sync with the UI
      const result = await saveWorkflowSteps(reorderedSteps);
      
      if (result === false) {
        throw new Error("فشل في حفظ التغييرات");
      }

      toast.success("تم حذف الخطوة بنجاح");
    } catch (error) {
      console.error("Error removing step:", error);
      toast.error(error.message || "حدث خطأ أثناء حذف الخطوة");
    }
  };

  return { handleRemoveStep };
};
