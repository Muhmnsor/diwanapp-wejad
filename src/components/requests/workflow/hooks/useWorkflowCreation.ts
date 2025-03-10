
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseWorkflowCreationProps {
  setWorkflowId: (id: string | null) => void;
  setError: (value: string | null) => void;
}

export const useWorkflowCreation = ({
  setWorkflowId,
  setError,
}: UseWorkflowCreationProps) => {

  const ensureWorkflowExists = async (requestTypeId: string | null, currentWorkflowId: string | null): Promise<string> => {
    // Check if we have a valid existing workflow ID
    if (currentWorkflowId && currentWorkflowId !== 'temp-workflow-id') {
      try {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(currentWorkflowId)) {
          console.error("Invalid workflow ID format:", currentWorkflowId);
          throw new Error("Invalid workflow ID format");
        }
        console.log("Using existing workflow ID:", currentWorkflowId);
        return currentWorkflowId;
      } catch (error) {
        console.error("Error validating workflow ID:", error);
        // Fall through to create a new workflow
      }
    }

    try {
      if (!requestTypeId) {
        console.log("No request type ID, returning temporary workflow ID");
        return 'temp-workflow-id';
      }

      console.log("Creating new workflow for request type:", requestTypeId);
      
      const { data: newWorkflow, error: createError } = await supabase
        .from('request_workflows')
        .insert({
          name: 'مسار افتراضي',
          request_type_id: requestTypeId,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating workflow:", createError);
        throw createError;
      }

      const newWorkflowId = newWorkflow.id;
      console.log("Created new workflow with ID:", newWorkflowId);
      setWorkflowId(newWorkflowId);
      
      return newWorkflowId;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('فشل في إنشاء مسار العمل');
      setError('فشل في إنشاء مسار العمل: ' + error.message);
      throw error;
    }
  };

  const updateDefaultWorkflow = async (requestTypeId: string | null, workflowId: string | null) => {
    if (!requestTypeId || !workflowId || workflowId === 'temp-workflow-id') {
      return;
    }
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workflowId) || !uuidRegex.test(requestTypeId)) {
      console.error("Invalid UUID format for updating default workflow:", { requestTypeId, workflowId });
      return;
    }
    
    console.log("Setting default workflow for request type:", requestTypeId, workflowId);
    const { error: updateError } = await supabase
      .from('request_types')
      .update({ default_workflow_id: workflowId })
      .eq('id', requestTypeId);

    if (updateError) {
      console.warn("Could not set default workflow for request type:", updateError);
      // Non-fatal error, continue
    } else {
      console.log("Successfully set default workflow for request type");
    }
  };

  return {
    ensureWorkflowExists,
    updateDefaultWorkflow
  };
};
