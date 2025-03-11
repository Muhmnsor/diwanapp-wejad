import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isValidUUID } from "./utils/validation";

interface UseEnsureWorkflowExistsProps {
  requestTypeId: string | null;
  workflowId: string | null;
  setWorkflowId: (id: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEnsureWorkflowExists = ({
  requestTypeId,
  workflowId,
  setWorkflowId,
  setIsLoading,
  setError
}: UseEnsureWorkflowExistsProps) => {
  // Function to ensure a workflow exists before saving steps
  const ensureWorkflowExists = useCallback(async (): Promise<string> => {
    // If we already have a valid workflow ID, return it
    if (workflowId && workflowId !== 'temp-workflow-id') {
      console.log("Using existing workflow ID:", workflowId);
      return workflowId;
    }
    
    // If there's no request type ID, we can't create a workflow
    if (!requestTypeId) {
      console.log("No request type ID, returning temporary workflow ID");
      return 'temp-workflow-id';
    }
    
    try {
      setIsLoading(true);
      
      // First, check if there's already a workflow for this request type
      const { data: existingWorkflows, error: workflowsError } = await supabase
        .from('request_workflows')
        .select('id')
        .eq('request_type_id', requestTypeId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (workflowsError) {
        console.error("Error checking existing workflows:", workflowsError);
        throw new Error("فشل في التحقق من مسارات سير العمل الموجودة");
      }
      
      let newWorkflowId: string;
      
      // If an active workflow exists, use it
      if (existingWorkflows && existingWorkflows.length > 0) {
        newWorkflowId = existingWorkflows[0].id;
        console.log("Using existing workflow:", newWorkflowId);
      } else {
        // Otherwise, create a new workflow
        console.log("Creating new workflow for request type:", requestTypeId);
        
        // Get the request type name for the workflow name
        const { data: requestType, error: requestTypeError } = await supabase
          .from('request_types')
          .select('name')
          .eq('id', requestTypeId)
          .single();
        
        if (requestTypeError) {
          console.error("Error fetching request type:", requestTypeError);
          throw new Error("فشل في العثور على نوع الطلب");
        }
        
        // Create the workflow
        const workflowName = `سير عمل ${requestType.name}`;
        
        const { data: newWorkflow, error: createError } = await supabase
          .from('request_workflows')
          .insert({
            name: workflowName,
            description: `سير العمل الافتراضي لـ ${requestType.name}`,
            request_type_id: requestTypeId,
            is_active: true,
            created_by: (await supabase.auth.getSession()).data.session?.user.id
          })
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating workflow:", createError);
          throw new Error("فشل في إنشاء سير عمل جديد");
        }
        
        newWorkflowId = newWorkflow.id;
        console.log("Created new workflow:", newWorkflowId);
      }
      
      // Update the state with the new workflow ID
      setWorkflowId(newWorkflowId);
      
      return newWorkflowId;
    } catch (error) {
      console.error("Error in ensureWorkflowExists:", error);
      setError(error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء سير العمل");
      
      // Return temporary ID if there's an error
      return 'temp-workflow-id';
    } finally {
      setIsLoading(false);
    }
  }, [requestTypeId, workflowId, setWorkflowId, setIsLoading, setError]);
  
  return { ensureWorkflowExists };
};
