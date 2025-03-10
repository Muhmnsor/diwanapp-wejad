
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
        // Verify UUID format and add validation checks
        if (!step.workflow_id) {
          console.error("Step missing workflow_id", step);
          throw new Error("خطأ: بعض الخطوات تفتقد إلى معرّف سير العمل");
        }
        
        // Make sure UUIDs are properly formatted
        return {
          ...step,
          workflow_id: currentWorkflowId,
          step_order: index + 1,
          step_type: step.step_type || 'decision',
          is_required: step.is_required === false ? false : true,
          approver_type: step.approver_type || 'user',
          // Ensure approver_id is valid - if it's not a valid UUID, this will throw
          approver_id: step.approver_id
        };
      });

      console.log("Inserting workflow steps using RPC bypass function with workflow_id:", currentWorkflowId);
      console.log("Steps to insert:", stepsToInsert);
      
      // Validate that all steps have workflow_id
      if (stepsToInsert.some(step => !step.workflow_id)) {
        console.error("Cannot insert steps with missing workflow_id");
        throw new Error("بعض الخطوات تفتقد إلى معرّف سير العمل");
      }
      
      // Convert steps to JSON strings for RPC function - ensure proper UUID formatting
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
        updateWorkflowSteps(rpcResult.data);
      } else {
        updateWorkflowSteps(stepsToInsert);
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
