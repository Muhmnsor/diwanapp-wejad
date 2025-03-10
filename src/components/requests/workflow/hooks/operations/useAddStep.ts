
import { useState } from "react";
import { WorkflowStep } from "../../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkUserPermissions } from "../utils/permissionUtils";
import { getInitialStepState } from "../../utils";

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

      // IMPORTANT: Ensure we're using the actual workflow ID, not the temporary one
      // This is a critical fix to ensure all steps get the correct workflow_id
      const workflowId = currentWorkflowId && currentWorkflowId !== 'temp-workflow-id' 
        ? currentWorkflowId 
        : currentStep.workflow_id && currentStep.workflow_id !== 'temp-workflow-id'
          ? currentStep.workflow_id
          : 'temp-workflow-id';
      
      console.log("Adding step with workflow ID:", workflowId);
      
      // Create a new step or update existing one
      const newStep: WorkflowStep = {
        ...currentStep,
        workflow_id: workflowId,
        id: currentStep.id || null,
        created_at: currentStep.created_at || null
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
      toast.error(error.message || "حدث خطأ أثناء حفظ الخطوة");
    }
  };

  return { handleAddStep };
};
