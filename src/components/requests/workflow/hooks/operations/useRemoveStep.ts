
import { WorkflowStep } from "../../../types";
import { toast } from "sonner";
import { checkUserPermissions } from "../utils/permissionUtils";

export const useRemoveStep = (
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>,
  setCurrentStep: (step: WorkflowStep) => void,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleRemoveStep = async (
    stepIndex: number, 
    workflowSteps: WorkflowStep[], 
    editingStepIndex: number | null,
    currentWorkflowId: string | null
  ) => {
    try {
      // Check user permissions
      const { session, isAdmin } = await checkUserPermissions();
      if (!session) return;

      // Create a copy of steps and remove the specified one
      const updatedSteps = workflowSteps.filter((_, index) => index !== stepIndex);

      // If we're editing the step that's being removed, or a step after it,
      // reset the editing state
      if (editingStepIndex !== null && editingStepIndex >= stepIndex) {
        setEditingStepIndex(null);
        // Reset current step
        setCurrentStep({
          id: null,
          workflow_id: currentWorkflowId || 'temp-workflow-id',
          step_name: '',
          step_type: 'decision',
          approver_id: null,
          instructions: null,
          is_required: true,
          approver_type: 'user',
          step_order: updatedSteps.length + 1,
          created_at: null
        });
      }

      // Update step order for all steps
      const reorderedSteps = updatedSteps.map((step, index) => ({
        ...step,
        step_order: index + 1
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
