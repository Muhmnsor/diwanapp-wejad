
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseUpdateDefaultWorkflowProps {
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUpdateDefaultWorkflow = ({
  setIsLoading,
  setError
}: UseUpdateDefaultWorkflowProps) => {
  // Function to update the default workflow for a request type
  const updateDefaultWorkflow = useCallback(async (
    requestTypeId: string | null, 
    workflowId: string | null
  ): Promise<void> => {
    // Skip if there's no request type or workflow ID
    if (!requestTypeId || !workflowId || workflowId === 'temp-workflow-id') {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check if this workflow is already the default
      const { data: requestType, error: requestTypeError } = await supabase
        .from('request_types')
        .select('default_workflow_id')
        .eq('id', requestTypeId)
        .single();
      
      if (requestTypeError) {
        console.error("Error fetching request type:", requestTypeError);
        return;
      }
      
      // If it's already the default, skip
      if (requestType.default_workflow_id === workflowId) {
        return;
      }
      
      // Update the default workflow using RPC function
      const { data: result, error: updateError } = await supabase
        .rpc('set_default_workflow', {
          p_request_type_id: requestTypeId,
          p_workflow_id: workflowId
        });
      
      if (updateError) {
        console.error("Error updating default workflow:", updateError);
        throw new Error("فشل في تعيين سير العمل الافتراضي");
      }
      
      if (result) {
        toast.success("تم تعيين سير العمل الافتراضي بنجاح");
      }
    } catch (error) {
      console.error("Error in updateDefaultWorkflow:", error);
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء تحديث سير العمل الافتراضي");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError]);
  
  return { updateDefaultWorkflow };
};
