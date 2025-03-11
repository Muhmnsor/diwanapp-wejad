
import { WorkflowStep } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isValidUUID } from "./utils/validation";

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

      // Get the actual workflow ID first
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
      
      // Ensure all steps have the correct workflowId
      const stepsWithCorrectWorkflowId = steps.map(step => ({
        ...step,
        workflow_id: currentWorkflowId
      }));
      
      // Prepare steps for insertion with complete data and ensure valid UUIDs
      const stepsToInsert = stepsWithCorrectWorkflowId.map((step, index) => {
        // Verify workflow_id format
        if (!isValidUUID(currentWorkflowId)) {
          console.error("Invalid workflow_id detected:", currentWorkflowId);
          throw new Error(`خطأ: معرّف سير العمل غير صالح (${currentWorkflowId})`);
        }
        
        if (!step.approver_id || !isValidUUID(step.approver_id)) {
          console.error("Step missing valid approver_id", step);
          throw new Error("خطأ: بعض الخطوات تفتقد إلى معرّف صحيح للمعتمد");
        }
        
        // Create a clean step object with only the required properties
        return {
          workflow_id: currentWorkflowId, // Always use the confirmed workflow ID
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
      
      // Log the operation attempt
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
      
      // Call the RPC function to insert steps
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('insert_workflow_steps', {
          steps: stepsToInsert
        });

      if (rpcError) {
        console.error("Error inserting workflow steps:", rpcError);
        
        // Log the error
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'insert_steps_error',
            p_workflow_id: currentWorkflowId,
            p_request_type_id: requestTypeId,
            p_error_message: rpcError.message,
            p_details: `فشل في حفظ ${stepsToInsert.length} خطوة لسير العمل`
          });
        } catch (logError) {
          console.warn("Error logging operation failure (non-critical):", logError);
        }
        
        throw new Error(`فشل في حفظ خطوات سير العمل: ${rpcError.message}`);
      }

      console.log("Steps saved successfully:", rpcResult);

      // Log the success
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'insert_steps_success',
          p_workflow_id: currentWorkflowId,
          p_request_type_id: requestTypeId,
          p_response_data: rpcResult,
          p_details: `تم حفظ ${stepsToInsert.length} خطوة لسير العمل بنجاح`
        });
      } catch (logError) {
        console.warn("Error logging operation success (non-critical):", logError);
      }

      // Update steps with server data
      if (rpcResult && rpcResult.data) {
        updateWorkflowSteps(rpcResult.data);
      } else {
        // If we don't have server data, use our local state
        updateWorkflowSteps(stepsWithCorrectWorkflowId);
      }

      // Update default workflow if needed
      await updateDefaultWorkflow(requestTypeId, currentWorkflowId);

      toast.success("تم حفظ خطوات سير العمل بنجاح");
      return true;
    } catch (error) {
      console.error("Error in saveWorkflowSteps:", error);
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء حفظ خطوات سير العمل");
      
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء حفظ خطوات سير العمل");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { saveWorkflowSteps };
};
