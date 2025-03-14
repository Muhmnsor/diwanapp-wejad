
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

      if (steps.length === 0) {
        updateWorkflowSteps([]);
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
      
      // Check if the current session user has permissions for this action
      console.log("Current user ID:", session?.user?.id);
      
      // Check if admin or has permission
      const { data: isPermitted, error: permissionError } = await supabase.rpc('is_admin');
      
      if (permissionError) {
        console.error("Error checking permissions:", permissionError);
        throw new Error("فشل في التحقق من الصلاحيات");
      }
      
      if (!isPermitted) {
        console.error("User doesn't have permission to manage workflow steps");
        throw new Error("ليس لديك الصلاحية لإدارة خطوات سير العمل");
      }
      
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
        // Check if it's a permissions error
        if (rpcError.code === '42501' || rpcError.message.includes('permission')) {
          throw new Error("ليس لديك الصلاحية لإنشاء أو تعديل خطوات سير العمل");
        }
        throw new Error(`فشل في حفظ خطوات سير العمل: ${rpcError.message}`);
      }

      console.log("Steps saved successfully:", rpcResult);
      
      // Add log of the database table to verify steps were actually inserted
      console.log("Checking inserted steps in workflow_steps table");
      const { data: checkSteps, error: checkError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', currentWorkflowId)
        .order('step_order', { ascending: true });
        
      if (checkError) {
        console.error("Error checking saved steps:", checkError);
      } else {
        console.log(`Found ${checkSteps?.length || 0} steps in database after save:`, checkSteps);
        
        // If no steps found in the new table, also check the legacy table
        if (!checkSteps || checkSteps.length === 0) {
          console.log("No steps found in workflow_steps table, checking legacy table");
          const { data: legacyCheckSteps, error: legacyCheckError } = await supabase
            .from('request_workflow_steps')
            .select('*')
            .eq('workflow_id', currentWorkflowId)
            .order('step_order', { ascending: true });
            
          if (legacyCheckError) {
            console.error("Error checking legacy table for saved steps:", legacyCheckError);
          } else {
            console.log(`Found ${legacyCheckSteps?.length || 0} steps in legacy table after save:`, legacyCheckSteps);
          }
        }
      }

      // Update steps with server data
      if (rpcResult && rpcResult.data) {
        updateWorkflowSteps(rpcResult.data);
      } else {
        // If we don't have server data, use our local state with correct IDs
        const updatedSteps = checkSteps || stepsWithCorrectWorkflowId;
        updateWorkflowSteps(updatedSteps);
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
