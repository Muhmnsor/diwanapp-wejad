
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

      // Debug log: Check authentication
      console.log("User authenticated with ID:", session.user.id);

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        throw new Error("خطأ في التحقق من صلاحيات المستخدم");
      }
      
      // Debug log: User roles
      console.log("User roles:", userRoles);
      
      const isAdmin = userRoles?.some(role => {
        if (role.roles) {
          const roleName = Array.isArray(role.roles) 
            ? (role.roles[0]?.name) 
            : (role.roles as any).name;
          return roleName === 'admin' || roleName === 'app_admin';
        }
        return false;
      });
      
      // Debug log: Admin status
      console.log("Is user admin?", isAdmin);
      
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
      
      // Debug log: Workflow steps before processing
      console.log("Original steps before processing:", steps);
      
      // Prepare steps for insertion with complete data and ensure valid UUIDs
      const stepsToInsert = steps.map((step, index) => {
        // Ensure each step has a workflow_id that matches the expected format
        const workflow_id = step.workflow_id || currentWorkflowId;
        
        // Verify workflow_id format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (!workflow_id || (workflow_id !== 'temp-workflow-id' && !uuidRegex.test(workflow_id))) {
          console.error("Step missing valid workflow_id", step);
          throw new Error(`خطأ: بعض الخطوات تفتقد إلى معرّف سير العمل الصحيح (${workflow_id})`);
        }
        
        if (!step.approver_id || !uuidRegex.test(step.approver_id)) {
          console.error("Step missing valid approver_id", step);
          throw new Error("خطأ: بعض الخطوات تفتقد إلى معرّف صحيح للمعتمد");
        }
        
        // Create a clean step object with only the required properties
        return {
          workflow_id: workflow_id,
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
      
      // تسجيل محاولة حفظ الخطوات
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'insert_steps_attempt',
          p_workflow_id: currentWorkflowId,
          p_request_type_id: requestTypeId,
          p_request_data: { steps: stepsToInsert },
          p_details: `محاولة حفظ ${stepsToInsert.length} خطوة لسير العمل`
        });
      } catch (logError) {
        console.warn("Error logging operation (non-critical):", logError);
      }
      
      // FIXED: Don't stringify the steps data here, send it as a proper JSON array
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('insert_workflow_steps', {
          steps: stepsToInsert
        });

      // Debug log: RPC call result
      console.log("RPC call completed. Result:", rpcResult, "Error:", rpcError);

      if (rpcError) {
        console.error("Error inserting workflow steps via RPC:", rpcError);
        
        // Debug log: Detailed error
        console.error("RPC error details:", {
          code: rpcError.code,
          message: rpcError.message,
          details: rpcError.details,
          hint: rpcError.hint
        });
        
        // تسجيل خطأ حفظ الخطوات
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'insert_steps_error',
            p_workflow_id: currentWorkflowId,
            p_request_type_id: requestTypeId,
            p_error_message: rpcError.message,
            p_details: `Error code: ${rpcError.code}, Message: ${rpcError.message}, Details: ${rpcError.details || 'No details'}`
          });
        } catch (logError) {
          console.warn("Error logging operation error (non-critical):", logError);
        }
        
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
        
        // Debug log: Error details
        console.error("RPC result error details:", rpcResult);
        
        // تسجيل خطأ نتيجة حفظ الخطوات
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'insert_steps_result_error',
            p_workflow_id: currentWorkflowId,
            p_request_type_id: requestTypeId,
            p_error_message: errorMessage,
            p_response_data: rpcResult,
            p_details: 'Error returned in successful RPC response'
          });
        } catch (logError) {
          console.warn("Error logging operation result error (non-critical):", logError);
        }
        
        throw new Error(`فشل في إدخال خطوات سير العمل: ${errorMessage}`);
      }

      console.log("Successfully inserted workflow steps via RPC:", rpcResult);
      
      // تسجيل نجاح حفظ الخطوات
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'insert_steps_success',
          p_workflow_id: currentWorkflowId,
          p_request_type_id: requestTypeId,
          p_response_data: rpcResult,
          p_details: `تم حفظ ${stepsToInsert.length} خطوة بنجاح`
        });
      } catch (logError) {
        console.warn("Error logging operation success (non-critical):", logError);
      }
      
      // Update the UI with the inserted steps
      if (rpcResult.data && Array.isArray(rpcResult.data)) {
        updateWorkflowSteps(rpcResult.data as WorkflowStep[]);
      } else {
        updateWorkflowSteps(stepsToInsert as WorkflowStep[]);
      }

      // Update default workflow for request type
      console.log("Updating default workflow for request type:", requestTypeId, currentWorkflowId);
      await updateDefaultWorkflow(requestTypeId, currentWorkflowId);
      console.log("Default workflow updated successfully");

      return true;
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      
      // Debug log: Detailed error capture
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      
      // تسجيل استثناء غير متوقع
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'unexpected_error',
          p_workflow_id: workflowId,
          p_request_type_id: requestTypeId,
          p_error_message: error.message,
          p_details: error.stack || 'No stack trace available'
        });
      } catch (logError) {
        console.warn("Error logging unexpected error (non-critical):", logError);
      }
      
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
