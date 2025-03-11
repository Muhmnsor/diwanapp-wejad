
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowStep } from "../../types";
import { getInitialStepState } from "../utils";

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
    // Don't fetch if there are initial steps, we're already initialized,
    // or there's no request type to fetch for
    if (initialSteps.length > 0 || initialized || !requestTypeId) {
      return;
    }
    
    const fetchWorkflow = async () => {
      try {
        setIsLoading(true);
        
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
        
        // If no default workflow, check if there's any workflow for this request type
        if (!fetchedWorkflowId) {
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
          }
        }
        
        // If we have a workflow ID, fetch its steps
        if (fetchedWorkflowId) {
          setWorkflowId(fetchedWorkflowId);
          
          const { data: steps, error: stepsError } = await supabase
            .from('request_workflow_steps') // Updated table name
            .select('*')
            .eq('workflow_id', fetchedWorkflowId)
            .order('step_order', { ascending: true });
          
          if (stepsError) {
            console.error("Error fetching workflow steps:", stepsError);
            throw new Error("فشل في العثور على خطوات سير العمل");
          }
          
          if (steps && steps.length > 0) {
            setWorkflowSteps(steps);
            setCurrentStep(getInitialStepState(steps.length + 1, fetchedWorkflowId));
          } else {
            setCurrentStep(getInitialStepState(1, fetchedWorkflowId));
          }
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
