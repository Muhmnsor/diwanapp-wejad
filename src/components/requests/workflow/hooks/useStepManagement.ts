
import { useState, useCallback } from "react";
import { WorkflowStep } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseStepManagementProps {
  saveWorkflowSteps: (steps: WorkflowStep[]) => Promise<boolean | undefined>;
  setCurrentStep: (step: WorkflowStep) => void;
  setEditingStepIndex: (index: number | null) => void;
}

export const useStepManagement = ({
  saveWorkflowSteps,
  setCurrentStep,
  setEditingStepIndex
}: UseStepManagementProps) => {
  // Function to handle adding a new step or updating an existing one
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

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول لإضافة خطوات");
        return;
      }

      // Check if user has admin role for permission check
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        return;
      }
      
      const isAdmin = userRoles?.some(role => {
        if (role.roles) {
          const roleName = Array.isArray(role.roles) 
            ? (role.roles[0]?.name) 
            : (role.roles as any).name;
          return roleName === 'admin' || roleName === 'app_admin';
        }
        return false;
      });
      
      if (!isAdmin) {
        console.warn("User might not have permission to add workflow steps");
      }

      // Determine workflow ID
      const workflowId = currentWorkflowId || currentStep.workflow_id || 'temp-workflow-id';
      
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
        step_order: index + 1
      }));

      // Save the updated steps
      await saveWorkflowSteps(updatedSteps);

      // Reset the current step and editing index
      setCurrentStep({
        id: null,
        workflow_id: workflowId,
        step_name: '',
        step_type: 'decision',
        approver_id: null,
        instructions: null,
        is_required: true,
        approver_type: 'user',
        step_order: updatedSteps.length + 1,
        created_at: null
      });
      setEditingStepIndex(null);

      toast.success(editingStepIndex !== null ? "تم تحديث الخطوة بنجاح" : "تمت إضافة الخطوة بنجاح");
    } catch (error) {
      console.error("Error adding/updating step:", error);
      toast.error(error.message || "حدث خطأ أثناء حفظ الخطوة");
    }
  };

  // Function to handle removing a step
  const handleRemoveStep = async (
    stepIndex: number, 
    workflowSteps: WorkflowStep[], 
    editingStepIndex: number | null,
    currentWorkflowId: string | null
  ) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول لحذف خطوات");
        return;
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        return;
      }
      
      const isAdmin = userRoles?.some(role => {
        if (role.roles) {
          const roleName = Array.isArray(role.roles) 
            ? (role.roles[0]?.name) 
            : (role.roles as any).name;
          return roleName === 'admin' || roleName === 'app_admin';
        }
        return false;
      });
      
      if (!isAdmin) {
        console.warn("User might not have permission to remove workflow steps");
      }

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

  // Function to put a step into edit mode
  const handleEditStep = (stepIndex: number, workflowSteps: WorkflowStep[], currentWorkflowId: string | null) => {
    if (stepIndex < 0 || stepIndex >= workflowSteps.length) return;
    
    const stepToEdit = workflowSteps[stepIndex];
    setCurrentStep({
      ...stepToEdit,
      workflow_id: stepToEdit.workflow_id || currentWorkflowId || 'temp-workflow-id'
    });
    setEditingStepIndex(stepIndex);
  };

  // Function to move a step up or down
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

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول لتعديل ترتيب الخطوات");
        return;
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        return;
      }
      
      const isAdmin = userRoles?.some(role => {
        if (role.roles) {
          const roleName = Array.isArray(role.roles) 
            ? (role.roles[0]?.name) 
            : (role.roles as any).name;
          return roleName === 'admin' || roleName === 'app_admin';
        }
        return false;
      });
      
      if (!isAdmin) {
        console.warn("User might not have permission to reorder workflow steps");
      }

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

  return {
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep
  };
};
