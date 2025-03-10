
import { WorkflowStep } from "../../../types";
import { toast } from "sonner";
import { getInitialStepState } from "../../utils";

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
      // Determine the correct workflow ID
      const workflowId = currentWorkflowId && currentWorkflowId !== 'temp-workflow-id' 
        ? currentWorkflowId 
        : workflowSteps.length > 0 && workflowSteps[0].workflow_id && workflowSteps[0].workflow_id !== 'temp-workflow-id'
          ? workflowSteps[0].workflow_id
          : 'temp-workflow-id';
      
      console.log(`Removing step at index ${index} with workflow ID:`, workflowId);
      
      // If we're removing the step that's currently being edited, reset the editing state
      if (editingStepIndex === index) {
        setCurrentStep(getInitialStepState(1, workflowId));
        setEditingStepIndex(null);
      }

      // Remove the step
      const updatedSteps = workflowSteps.filter((_, i) => i !== index);

      // Update step order
      const reorderedSteps = updatedSteps.map((step, i) => ({
        ...step,
        step_order: i + 1,
        workflow_id: workflowId // Ensure consistent workflow ID
      }));

      // Save the updated steps
      await saveWorkflowSteps(reorderedSteps);

      toast.success("تم حذف الخطوة بنجاح");
    } catch (error) {
      console.error("Error removing step:", error);
      toast.error(error.message || "حدث خطأ أثناء حذف الخطوة");
    }
  };

  return { handleRemoveStep };
};
