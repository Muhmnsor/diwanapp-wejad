
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
    // First check for session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("يجب تسجيل الدخول لحفظ خطوات سير العمل");
      setError("يجب تسجيل الدخول لحفظ خطوات سير العمل");
      return false;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Get the actual workflow ID first (this is critical)
      console.log("Calling ensureWorkflowExists to get valid workflow ID");
      const currentWorkflowId = await ensureWorkflowExists();
      console.log("Received workflow ID:", currentWorkflowId);

      if (currentWorkflowId === 'temp-workflow-id') {
        if (!requestTypeId) {
          console.log("No request type ID and using temporary workflow ID, saving steps locally only");
          
          const stepsWithWorkflowId = steps.map(step => ({
            ...step,
            workflow_id: currentWorkflowId
          }));
          
          updateWorkflowSteps(stepsWithWorkflowId);
          return true;
        } else {
          console.error("Failed to create workflow even though we have a request type ID");
          toast.error("فشل في إنشاء سير العمل. يرجى المحاولة مرة أخرى.");
          return false;
        }
      }

      // Handle empty steps array - we still need to process the deletion in the database
      if (steps.length === 0) {
        console.log("Saving empty steps list for workflow:", currentWorkflowId);
        
        // Delete all steps from this workflow in the database
        const { error: deleteError } = await supabase
          .from('workflow_steps')
          .delete()
          .eq('workflow_id', currentWorkflowId);
          
        if (deleteError) {
          console.error("Error deleting workflow steps:", deleteError);
          throw new Error(`فشل في حذف خطوات سير العمل: ${deleteError.message}`);
        }
        
        // Update local state
        updateWorkflowSteps([]);
        toast.success("تم حفظ خطوات سير العمل بنجاح");
        
        // Update default workflow if needed
        if (requestTypeId) {
          await updateDefaultWorkflow(requestTypeId, currentWorkflowId);
        }
        
        return true;
      }
      
      // Ensure all steps have the correct workflowId
      const stepsWithCorrectWorkflowId = steps.map(step => ({
        ...step,
        workflow_id: currentWorkflowId
      }));
      
      // Log for debugging
      console.log("Preparing steps with workflow ID:", currentWorkflowId);
      console.log("Steps to insert:", stepsWithCorrectWorkflowId);
      
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

      console.log("Sending steps to database RPC function");
      
      // Call the RPC function to insert steps - with detailed logging
      console.log("Calling RPC function insert_workflow_steps with parameters:", JSON.stringify(stepsToInsert));
      
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('insert_workflow_steps', {
          steps: stepsToInsert
        });

      if (rpcError) {
        console.error("Error inserting workflow steps:", rpcError);
        throw new Error(`فشل في حفظ خطوات سير العمل: ${rpcError.message}`);
      }

      console.log("Steps saved successfully:", rpcResult);

      // Update steps with server data
      if (rpcResult && rpcResult.data) {
        updateWorkflowSteps(rpcResult.data);
      } else {
        // If we don't have server data, use our local state
        updateWorkflowSteps(stepsWithCorrectWorkflowId);
      }

      // Update default workflow if needed
      if (requestTypeId) {
        await updateDefaultWorkflow(requestTypeId, currentWorkflowId);
      }

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
