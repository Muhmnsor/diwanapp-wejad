
import { WorkflowStep } from "../../types";
import { toast } from "sonner";
import { getInitialStepState } from "../utils";
import { supabase } from "@/integrations/supabase/client";

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

  const handleAddStep = async (
    currentStep: WorkflowStep,
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    workflowId: string | null
  ) => {
    if (!currentStep.step_name) {
      toast.error('يرجى إدخال اسم الخطوة');
      return;
    }
    
    if (!currentStep.approver_id) {
      toast.error('يرجى اختيار المعتمد');
      return;
    }

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول لإضافة خطوات سير العمل");
        return;
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles:roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        toast.error("خطأ في التحقق من صلاحيات المستخدم");
        return;
      }
      
      const isAdmin = userRoles?.some(role => 
        role.roles?.name === 'admin' || role.roles?.name === 'app_admin'
      );
      
      if (!isAdmin) {
        console.warn("User might not have permission to add workflow steps");
      }

      const current_workflow_id = workflowId || 'temp-workflow-id';
      
      // Ensure workflow_id is consistent
      const stepWithWorkflowId = {
        ...currentStep,
        workflow_id: current_workflow_id
      };

      console.log("Current workflow ID:", current_workflow_id);
      console.log("Step with workflow ID:", stepWithWorkflowId);

      let updatedSteps: WorkflowStep[];

      // When editing, replace the step at the editing index
      if (editingStepIndex !== null) {
        updatedSteps = [...workflowSteps];
        updatedSteps[editingStepIndex] = stepWithWorkflowId;
      } else {
        // When adding, append the new step
        updatedSteps = [...workflowSteps, stepWithWorkflowId];
      }

      // Make sure all steps have the same workflow_id
      updatedSteps = updatedSteps.map(step => ({
        ...step,
        workflow_id: current_workflow_id
      }));

      console.log("Adding/updating step with workflow_id:", stepWithWorkflowId);
      console.log("Updated steps:", updatedSteps);
      
      // Actually save the steps
      try {
        await saveWorkflowSteps(updatedSteps);
        toast.success(editingStepIndex !== null ? 'تم تحديث الخطوة بنجاح' : 'تمت إضافة الخطوة بنجاح');
        
        setCurrentStep({
          ...getInitialStepState(updatedSteps.length + 1),
          workflow_id: current_workflow_id
        });
        setEditingStepIndex(null);
      } catch (error) {
        console.error("Error during save:", error);
        
        // Provide more specific error messages for common issues
        if (error.message && error.message.includes('صلاحية')) {
          toast.error(`ليس لديك صلاحية لإضافة خطوات سير العمل`);
        } else if (error.message && error.message.includes('foreign key')) {
          toast.error(`خطأ في العلاقات بين البيانات. يرجى التأكد من وجود مسار العمل`);
        } else {
          toast.error(`فشل في حفظ الخطوة: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast.error(`فشل في التحقق من صلاحيات المستخدم: ${error.message}`);
    }
  };

  const handleRemoveStep = async (
    index: number,
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    workflowId: string | null
  ) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول لحذف خطوات سير العمل");
        return;
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles:roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        toast.error("خطأ في التحقق من صلاحيات المستخدم");
        return;
      }
      
      const isAdmin = userRoles?.some(role => 
        role.roles?.name === 'admin' || role.roles?.name === 'app_admin'
      );
      
      if (!isAdmin) {
        console.warn("User might not have permission to remove workflow steps");
      }

      const current_workflow_id = workflowId || 'temp-workflow-id';
      const updatedSteps = workflowSteps
        .filter((_, i) => i !== index)
        .map((step, i) => ({
          ...step,
          step_order: i + 1,
          workflow_id: step.workflow_id || current_workflow_id
        }));
      
      console.log("Removing step at index:", index);
      console.log("Updated steps after removal:", updatedSteps);
      
      await saveWorkflowSteps(updatedSteps);
      toast.success('تم حذف الخطوة بنجاح');
      
      if (editingStepIndex === index) {
        setEditingStepIndex(null);
        setCurrentStep({
          ...getInitialStepState(updatedSteps.length + 1),
          workflow_id: current_workflow_id
        });
      }
    } catch (error) {
      console.error("Error during step removal:", error);
      
      // Provide more specific error messages for common issues
      if (error.message && error.message.includes('صلاحية')) {
        toast.error(`ليس لديك صلاحية لحذف خطوات سير العمل`);
      } else {
        toast.error(`فشل في حذف الخطوة: ${error.message}`);
      }
    }
  };

  const handleEditStep = async (index: number, workflowSteps: WorkflowStep[], workflowId: string | null) => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول لتعديل خطوات سير العمل");
        return;
      }

      console.log("Editing step at index:", index);
      const current_workflow_id = workflowId || 'temp-workflow-id';
      const stepToEdit = {
        ...workflowSteps[index],
        workflow_id: workflowSteps[index].workflow_id || current_workflow_id
      };
      setCurrentStep(stepToEdit);
      setEditingStepIndex(index);
    } catch (error) {
      console.error("Error checking authentication:", error);
      toast.error(`فشل في التحقق من صلاحيات المستخدم: ${error.message}`);
    }
  };

  const handleMoveStep = async (
    index: number,
    direction: 'up' | 'down',
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null,
    workflowId: string | null
  ) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === workflowSteps.length - 1)
    ) {
      return;
    }

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("يجب تسجيل الدخول لتغيير ترتيب خطوات سير العمل");
        return;
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles:roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        toast.error("خطأ في التحقق من صلاحيات المستخدم");
        return;
      }
      
      const isAdmin = userRoles?.some(role => 
        role.roles?.name === 'admin' || role.roles?.name === 'app_admin'
      );
      
      if (!isAdmin) {
        console.warn("User might not have permission to reorder workflow steps");
      }

      const current_workflow_id = workflowId || 'temp-workflow-id';
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const updatedSteps = [...workflowSteps];
      
      [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
      
      updatedSteps.forEach((step, i) => {
        step.step_order = i + 1;
        step.workflow_id = step.workflow_id || current_workflow_id;
      });

      console.log(`Moving step ${index} ${direction} to ${newIndex}`);
      console.log("Updated steps after move:", updatedSteps);
      
      await saveWorkflowSteps(updatedSteps);
      toast.success(`تم ${direction === 'up' ? 'رفع' : 'خفض'} الخطوة بنجاح`);
      
      if (editingStepIndex === index) {
        setEditingStepIndex(newIndex);
      } else if (editingStepIndex === newIndex) {
        setEditingStepIndex(index);
      }
    } catch (error) {
      console.error("Error moving step:", error);
      
      // Provide more specific error messages for common issues
      if (error.message && error.message.includes('صلاحية')) {
        toast.error(`ليس لديك صلاحية لتغيير ترتيب خطوات سير العمل`);
      } else {
        toast.error(`فشل في تحريك الخطوة: ${error.message}`);
      }
    }
  };

  return {
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep
  };
};
