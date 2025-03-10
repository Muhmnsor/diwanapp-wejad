import { WorkflowStep } from "../../../types";
import { toast } from "sonner";
import { isValidUUID } from "../utils/validation";

export const useMoveStep = (
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleMoveStep = async (
    index: number,
    direction: 'up' | 'down',
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    currentWorkflowId: string | null
  ) => {
    try {
      // Validate inputs
      if (index < 0 || index >= workflowSteps.length) {
        throw new Error("خطأ: الخطوة المطلوبة غير موجودة");
      }
      
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === workflowSteps.length - 1)
      ) {
        console.log(`Cannot move step ${direction} at index ${index}`);
        return;
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
      
      console.log(`Moving step at index ${index} ${direction} with workflow ID:`, workflowId);
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const updatedSteps = [...workflowSteps];
      const temp = updatedSteps[index];
      updatedSteps[index] = updatedSteps[newIndex];
      updatedSteps[newIndex] = temp;

      // Update editing index if the moved step is being edited
      if (editingStepIndex === index) {
        setEditingStepIndex(newIndex);
      } else if (editingStepIndex === newIndex) {
        setEditingStepIndex(index);
      }

      // Update step order
      const reorderedSteps = updatedSteps.map((step, i) => ({
        ...step,
        step_order: i + 1,
        workflow_id: workflowId // Ensure consistent workflow ID
      }));

      // Save the updated steps
      const result = await saveWorkflowSteps(reorderedSteps);
      
      if (result === false) {
        throw new Error("فشل في حفظ التغييرات");
      }

      toast.success("تم تغيير ترتيب الخطوة بنجاح");
    } catch (error) {
      console.error("Error moving step:", error);
      toast.error(error.message || "حدث خطأ أثناء تغيير ترتيب الخطوة");
    }
  };

  return { handleMoveStep };
};
