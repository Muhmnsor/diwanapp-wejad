
import { WorkflowStep } from "../../../types";
import { toast } from "sonner";
import { checkUserPermissions } from "../utils/permissionUtils";

export const useMoveStep = (
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleMoveStep = async (
    stepIndex: number, 
    direction: 'up' | 'down', 
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    currentWorkflowId: string | null
  ) => {
    try {
      // Check if move is possible
      if (
        (direction === 'up' && stepIndex === 0) || 
        (direction === 'down' && stepIndex === workflowSteps.length - 1)
      ) {
        return; // Can't move beyond boundaries
      }

      // Check user permissions
      const { session, isAdmin } = await checkUserPermissions();
      if (!session) return;

      // Create a copy of the steps array
      const updatedSteps = [...workflowSteps];

      // Calculate the new index
      const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;

      // Swap the steps
      [updatedSteps[stepIndex], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[stepIndex]];

      // Update step order for all steps
      const reorderedSteps = updatedSteps.map((step, index) => ({
        ...step,
        step_order: index + 1
      }));

      // Save the updated steps
      await saveWorkflowSteps(reorderedSteps);

      // If we're editing one of the moved steps, update the editing index
      if (editingStepIndex === stepIndex) {
        setEditingStepIndex(newIndex);
      } else if (editingStepIndex === newIndex) {
        setEditingStepIndex(stepIndex);
      }

      toast.success("تم تغيير ترتيب الخطوات بنجاح");
    } catch (error) {
      console.error("Error moving step:", error);
      toast.error(error.message || "حدث خطأ أثناء تغيير ترتيب الخطوات");
    }
  };

  return { handleMoveStep };
};
