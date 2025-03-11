
import { WorkflowStep } from "../../../types";
import { toast } from "sonner";
import { checkUserPermissions } from "../utils/permissionUtils";
import { getInitialStepState } from "../../utils";
import { isValidUUID } from "../utils/validation";

export const useAddStep = (
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>,
  setCurrentStep: (step: WorkflowStep) => void,
  setEditingStepIndex: (index: number | null) => void
) => {
  const handleAddStep = async (
    currentStep: WorkflowStep, 
    workflowSteps: WorkflowStep[], 
    editingStepIndex: number | null,
    currentWorkflowId: string | null
  ) => {
    try {
      // Check if step has an approver
      if (!currentStep.approver_id) {
        toast.error("يرجى تحديد معتمد للخطوة");
        return;
      }

      // Check if step has a name
      if (!currentStep.step_name || currentStep.step_name.trim() === '') {
        toast.error("يرجى إدخال اسم للخطوة");
        return;
      }

      // Check user permissions
      const { session, isAdmin } = await checkUserPermissions();
      if (!session) return;

      // Ensure current step has a valid workflow ID
      console.log("Current step workflow_id:", currentStep.workflow_id);
      console.log("Current workflow ID:", currentWorkflowId);
      
      // Determine the correct workflow ID to use
      let workflowId = 'temp-workflow-id';
      
      // First try to use the provided workflow ID
      if (currentWorkflowId && currentWorkflowId !== 'temp-workflow-id' && isValidUUID(currentWorkflowId)) {
        workflowId = currentWorkflowId;
        console.log(`Using current workflow ID: ${workflowId}`);
      } 
      // Then try the current step's workflow ID
      else if (currentStep.workflow_id && 
              currentStep.workflow_id !== 'temp-workflow-id' && 
              isValidUUID(currentStep.workflow_id)) {
        workflowId = currentStep.workflow_id;
        console.log(`Using step's workflow ID: ${workflowId}`);
      }
      // Then try the first step's workflow ID
      else if (workflowSteps.length > 0 && 
              workflowSteps[0].workflow_id && 
              workflowSteps[0].workflow_id !== 'temp-workflow-id' &&
              isValidUUID(workflowSteps[0].workflow_id)) {
        workflowId = workflowSteps[0].workflow_id;
        console.log(`Using workflow ID from existing steps: ${workflowId}`);
      } else {
        console.log(`Using temporary workflow ID: ${workflowId}`);
      }
      
      // Create a new step or update existing one
      const newStep: WorkflowStep = {
        ...currentStep,
        workflow_id: workflowId
      };

      let updatedSteps: WorkflowStep[];

      // If we're editing an existing step
      if (editingStepIndex !== null && editingStepIndex >= 0) {
        updatedSteps = [...workflowSteps];
        updatedSteps[editingStepIndex] = newStep;
      } else {
        // Add to the end of the array
        updatedSteps = [...workflowSteps, newStep];
      }

      // Update step order
      updatedSteps = updatedSteps.map((step, index) => ({
        ...step,
        step_order: index + 1,
        // Ensure all steps have the same workflow_id
        workflow_id: workflowId
      }));

      // Log for debugging
      console.log("Steps to save:", updatedSteps);

      // Save the updated steps
      await saveWorkflowSteps(updatedSteps);

      // Reset the current step and editing index
      setCurrentStep(getInitialStepState(updatedSteps.length + 1, workflowId));
      setEditingStepIndex(null);

      toast.success(editingStepIndex !== null ? "تم تحديث الخطوة بنجاح" : "تمت إضافة الخطوة بنجاح");
    } catch (error) {
      console.error("Error adding/updating step:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حفظ الخطوة");
    }
  };

  return { handleAddStep };
};
