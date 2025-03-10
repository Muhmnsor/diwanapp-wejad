
import { WorkflowStep } from "../../../types";
import { toast } from "sonner";

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
      // Determine the correct workflow ID
      const workflowId = currentWorkflowId && currentWorkflowId !== 'temp-workflow-id' 
        ? currentWorkflowId 
        : workflowSteps.length > 0 && workflowSteps[0].workflow_id && workflowSteps[0].workflow_id !== 'temp-workflow-id'
          ? workflowSteps[0].workflow_id
          : 'temp-workflow-id';
      
      console.log(`Moving step at index ${index} ${direction} with workflow ID:`, workflowId);
      
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === workflowSteps.length - 1)
      ) {
        return;
      }

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
      await saveWorkflowSteps(reorderedSteps);

      toast.success("تم تغيير ترتيب الخطوة بنجاح");
    } catch (error) {
      console.error("Error moving step:", error);
      toast.error(error.message || "حدث خطأ أثناء تغيير ترتيب الخطوة");
    }
  };

  return { handleMoveStep };
};
