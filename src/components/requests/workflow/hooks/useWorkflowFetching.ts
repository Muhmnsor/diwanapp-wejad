
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowStep } from "../../types";
import { getInitialStepState } from "../utils";
import { isValidUUID } from "./utils/validation";

interface UseWorkflowFetchingProps {
  requestTypeId: string | null;
  workflowId: string;
  initialSteps: WorkflowStep[];
  initialized: boolean;
  setWorkflowId: (id: string) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setInitialized: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkflowFetching = ({
  requestTypeId,
  workflowId,
  initialSteps,
  initialized,
  setWorkflowId,
  setWorkflowSteps,
  setCurrentStep,
  setInitialized,
  setIsLoading,
  setError
}: UseWorkflowFetchingProps) => {
  // Fetch workflow and its steps from the database
  useEffect(() => {
    // Don't fetch if we're already initialized
    // But DO fetch if we have a workflowId that doesn't match temp-workflow-id
    if (initialized && (workflowId !== 'temp-workflow-id' || !requestTypeId)) {
      return;
    }
    
    const fetchWorkflow = async () => {
      try {
        setIsLoading(true);
        
        // If we already have a valid workflow ID (not the temp one), use it directly
        if (isValidUUID(workflowId)) {
          console.log(`Using provided workflow ID: ${workflowId} directly`);
          
          // Fetch steps for this workflow ID
          await fetchWorkflowSteps(workflowId);
          setInitialized(true);
          return;
        }
        
        // If we don't have a valid workflow ID but have a request type ID, look for a workflow
        if (!requestTypeId) {
          console.log("No request type ID provided, cannot fetch workflow");
          setCurrentStep(getInitialStepState(1, 'temp-workflow-id'));
          setInitialized(true);
          return;
        }
        
        // First, check if the request type has a default workflow
        const { data: requestType, error: requestTypeError } = await supabase
          .from('request_types')
          .select('default_workflow_id')
          .eq('id', requestTypeId)
          .single();
        
        if (requestTypeError) {
          console.error("Error fetching request type:", requestTypeError);
          throw new Error("فشل في العثور على نوع الطلب");
        }
        
        let fetchedWorkflowId = requestType.default_workflow_id;
        console.log("Request type default workflow ID:", fetchedWorkflowId);
        
        // If no default workflow, check if there's any workflow for this request type
        if (!fetchedWorkflowId) {
          console.log("No default workflow found, searching for active workflows");
          const { data: workflows, error: workflowsError } = await supabase
            .from('request_workflows')
            .select('id')
            .eq('request_type_id', requestTypeId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (workflowsError) {
            console.error("Error fetching workflows:", workflowsError);
            throw new Error("فشل في العثور على مسارات سير العمل");
          }
          
          if (workflows && workflows.length > 0) {
            fetchedWorkflowId = workflows[0].id;
            console.log("Found active workflow ID:", fetchedWorkflowId);
          } else {
            console.log("No active workflows found for request type");
          }
        }
        
        // If we have a workflow ID, fetch its steps
        if (fetchedWorkflowId) {
          console.log(`Found workflow ID: ${fetchedWorkflowId}, fetching steps`);
          setWorkflowId(fetchedWorkflowId);
          
          // Fetch steps for this workflow
          await fetchWorkflowSteps(fetchedWorkflowId);
        } else {
          // No workflow found, use temporary ID
          console.log("No workflow found for request type, using temporary ID");
          setCurrentStep(getInitialStepState(1, 'temp-workflow-id'));
        }
        
        setInitialized(true);
      } catch (error) {
        console.error("Error in fetchWorkflow:", error);
        setError(error instanceof Error ? error.message : "حدث خطأ أثناء تحميل خطوات سير العمل");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to fetch workflow steps for a specific workflow ID
    const fetchWorkflowSteps = async (wfId: string) => {
      if (!isValidUUID(wfId)) {
        console.error("Invalid workflow ID:", wfId);
        throw new Error("معرف سير العمل غير صالح");
      }
      
      // First try the new workflow_steps table
      const { data: newSteps, error: newStepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', wfId)
        .order('step_order', { ascending: true });
      
      if (newStepsError) {
        console.error("Error fetching from workflow_steps:", newStepsError);
      }
      
      if (newSteps && newSteps.length > 0) {
        console.log(`Found ${newSteps.length} steps in workflow_steps table:`, newSteps);
        setWorkflowSteps(newSteps);
        setCurrentStep(getInitialStepState(newSteps.length + 1, wfId));
        return true;
      }
      
      // If no steps in the new table, try the legacy table
      console.log("No steps found in workflow_steps table, checking legacy table");
      const { data: legacySteps, error: legacyStepsError } = await supabase
        .from('request_workflow_steps')
        .select('*')
        .eq('workflow_id', wfId)
        .order('step_order', { ascending: true });
      
      if (legacyStepsError) {
        console.error("Error fetching from request_workflow_steps:", legacyStepsError);
        throw new Error("فشل في العثور على خطوات سير العمل");
      }
      
      if (legacySteps && legacySteps.length > 0) {
        console.log(`Found ${legacySteps.length} steps in legacy request_workflow_steps table:`, legacySteps);
        setWorkflowSteps(legacySteps);
        setCurrentStep(getInitialStepState(legacySteps.length + 1, wfId));
        return true;
      } else {
        console.log("No workflow steps found in either table");
        setWorkflowSteps([]);
        setCurrentStep(getInitialStepState(1, wfId));
        return false;
      }
    };
    
    fetchWorkflow();
  }, [
    requestTypeId,
    initialSteps,
    initialized,
    workflowId,
    setWorkflowId,
    setWorkflowSteps,
    setCurrentStep,
    setInitialized,
    setIsLoading,
    setError
  ]);
};
