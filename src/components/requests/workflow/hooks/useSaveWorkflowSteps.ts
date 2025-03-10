
import { WorkflowStep } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseSaveWorkflowStepsProps {
  requestTypeId: string | null;
  workflowId: string | null;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  updateWorkflowSteps: (steps: WorkflowStep[]) => void;
  ensureWorkflowExists: () => Promise<string>;
  updateDefaultWorkflow: (requestTypeId: string | null, workflowId: string | null) => Promise<void>;
}

export const useSaveWorkflowSteps = ({
  requestTypeId,
  workflowId,
  setIsLoading,
  setError,
  updateWorkflowSteps,
  ensureWorkflowExists,
  updateDefaultWorkflow
}: UseSaveWorkflowStepsProps) => {

  const saveWorkflowSteps = async (steps: WorkflowStep[]): Promise<boolean | undefined> => {
    if (!requestTypeId) {
      console.log("Saving steps locally for new request type:", steps);
      
      const currentWorkflowId = workflowId || 'temp-workflow-id';
      const stepsWithWorkflowId = steps.map(step => ({
        ...step,
        workflow_id: step.workflow_id || currentWorkflowId
      }));
      
      updateWorkflowSteps(stepsWithWorkflowId);
      return true;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("يجب تسجيل الدخول لحفظ خطوات سير العمل");
        throw new Error("يجب تسجيل الدخول لحفظ خطوات سير العمل");
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        throw new Error("خطأ في التحقق من صلاحيات المستخدم");
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
        console.warn("User might not have permission to save workflow steps");
      }

      const currentWorkflowId = await ensureWorkflowExists();
      console.log("Working with workflow ID:", currentWorkflowId);

      if (currentWorkflowId === 'temp-workflow-id') {
        console.log("Using temporary workflow ID, saving steps locally only");
        
        const stepsWithWorkflowId = steps.map(step => ({
          ...step,
          workflow_id: currentWorkflowId
        }));
        
        updateWorkflowSteps(stepsWithWorkflowId);
        setIsLoading(false);
        return true;
      }

      if (steps.length === 0) {
        updateWorkflowSteps([]);
        setIsLoading(false);
        return true;
      }
      
      // Prepare steps for insertion with complete data and ensure valid UUIDs
      const stepsToInsert = steps.map((step, index) => {
        // Verify workflow_id format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (!step.workflow_id || !uuidRegex.test(currentWorkflowId)) {
          console.error("Step missing valid workflow_id", step);
          throw new Error("خطأ: بعض الخطوات تفتقد إلى معرّف سير العمل الصحيح");
        }
        
        if (!step.approver_id || !uuidRegex.test(step.approver_id)) {
          console.error("Step missing valid approver_id", step);
          throw new Error("خطأ: بعض الخطوات تفتقد إلى معرّف صحيح للمعتمد");
        }
        
        // Create a clean step object with only the required properties
        return {
          workflow_id: currentWorkflowId,
          step_order: index + 1,
          step_name: step.step_name,
          step_type: step.step_type || 'decision',
          approver_id: step.approver_id,
          instructions: step.instructions || null,
          is_required: step.is_required === false ? false : true,
          approver_type: step.approver_type || 'user',
          id: step.id || null,
          created_at: step.created_at || null
        };
      });

      console.log("Inserting workflow steps using RPC function with workflow_id:", currentWorkflowId);
      console.log("Steps to insert:", stepsToInsert);
      
      // Convert steps to JSON strings for RPC function
      const jsonSteps = stepsToInsert.map(step => {
        // Log each step for debugging
        console.log("Preparing step for RPC:", step);
        // Return the JSON string
        return JSON.stringify(step);
      });
      
      // Call the RPC function to insert steps
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('insert_workflow_steps', {
          steps: jsonSteps
        });

      if (rpcError) {
        console.error("Error inserting workflow steps via RPC:", rpcError);
        if (rpcError.code === 'PGRST116') {
          throw new Error("ليس لديك صلاحية لإدخال خطوات سير العمل");
        }
        throw new Error(`فشل في إدخال خطوات سير العمل: ${rpcError.message}`);
      }

      console.log("RPC function result:", rpcResult);

      // Check if the RPC function returned an error
      if (!rpcResult || !rpcResult.success) {
        const errorMessage = rpcResult?.error || rpcResult?.message || 'حدث خطأ غير معروف';
        console.error("Error returned from RPC function:", errorMessage);
        throw new Error(`فشل في إدخال خطوات سير العمل: ${errorMessage}`);
      }

      console.log("Successfully inserted workflow steps via RPC:", rpcResult);
      
      // Update the UI with the inserted steps
      if (rpcResult.data && Array.isArray(rpcResult.data)) {
        updateWorkflowSteps(rpcResult.data as WorkflowStep[]);
      } else {
        updateWorkflowSteps(stepsToInsert as WorkflowStep[]);
      }

      // Update default workflow for request type
      await updateDefaultWorkflow(requestTypeId, currentWorkflowId);

      return true;
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      setError(error.message || 'فشل في حفظ خطوات سير العمل');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveWorkflowSteps
  };
};
