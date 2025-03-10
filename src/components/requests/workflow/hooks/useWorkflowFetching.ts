
import { useEffect } from "react";
import { WorkflowStep } from "../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getInitialStepState } from "../utils";

interface UseWorkflowFetchingProps {
  requestTypeId: string | null;
  workflowId: string | null;
  initialSteps: WorkflowStep[];
  initialized: boolean;
  setWorkflowId: (id: string | null) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setInitialized: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
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
  useEffect(() => {
    const fetchWorkflowSteps = async () => {
      if (!requestTypeId && !workflowId) {
        if (!initialized && initialSteps.length > 0) {
          const workflowIdToUse = initialSteps[0]?.workflow_id || 'temp-workflow-id';
          
          console.log("No request type ID, using workflowId:", workflowIdToUse);
          
          const stepsWithWorkflowId = initialSteps.map(step => ({
            ...step,
            workflow_id: step.workflow_id || workflowIdToUse
          }));
          
          setWorkflowSteps(stepsWithWorkflowId);
          setWorkflowId(workflowIdToUse);
          setInitialized(true);
        } else if (!initialized) {
          setWorkflowSteps([]);
          setWorkflowId('temp-workflow-id');
          setInitialized(true);
        }
        return;
      }

      if (initialized) return;

      setIsLoading(true);
      setError(null);

      try {
        if (workflowId && workflowId !== 'temp-workflow-id') {
          console.log("Using existing workflow ID for fetching steps:", workflowId);
          
          const { data: steps, error: stepsError } = await supabase
            .from('workflow_steps')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('step_order', { ascending: true });

          if (stepsError) throw stepsError;
          
          console.log("Fetched workflow steps:", steps);
          
          const stepsWithWorkflowId = steps ? steps.map(step => ({
            ...step,
            workflow_id: workflowId
          })) : [];
          
          setWorkflowSteps(stepsWithWorkflowId);
          setCurrentStep({
            ...getInitialStepState(stepsWithWorkflowId.length + 1),
            workflow_id: workflowId
          });
          setInitialized(true);
          return;
        }

        const { data: requestType, error: requestTypeError } = await supabase
          .from('request_types')
          .select('default_workflow_id')
          .eq('id', requestTypeId)
          .single();

        if (requestTypeError) throw requestTypeError;

        const workflow_id = requestType?.default_workflow_id || 'temp-workflow-id';
        console.log("Got workflow ID from request type:", workflow_id);
        setWorkflowId(workflow_id);

        if (!requestType?.default_workflow_id) {
          if (!initialized && initialSteps.length > 0) {
            const stepsWithWorkflowId = initialSteps.map(step => ({
              ...step,
              workflow_id
            }));
            setWorkflowSteps(stepsWithWorkflowId);
          } else {
            setWorkflowSteps([]);
          }
          setCurrentStep({
            ...getInitialStepState(1),
            workflow_id
          });
          setInitialized(true);
          return;
        }

        const { data: steps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflow_id)
          .order('step_order', { ascending: true });

        if (stepsError) throw stepsError;
        
        console.log("Fetched workflow steps:", steps);
        
        const stepsWithWorkflowId = steps ? steps.map(step => ({
          ...step,
          workflow_id
        })) : [];
        
        setWorkflowSteps(stepsWithWorkflowId);
        setCurrentStep({
          ...getInitialStepState(stepsWithWorkflowId.length + 1),
          workflow_id
        });
        setInitialized(true);
      } catch (error) {
        console.error('Error fetching workflow steps:', error);
        toast.error('فشل في جلب خطوات سير العمل');
        setError('فشل في جلب خطوات سير العمل');
        
        if (!initialized && initialSteps.length > 0) {
          const workflow_id = workflowId || 'temp-workflow-id';
          const stepsWithWorkflowId = initialSteps.map(step => ({
            ...step,
            workflow_id
          }));
          setWorkflowSteps(stepsWithWorkflowId);
          setInitialized(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (!initialized) {
      fetchWorkflowSteps();
    }
  }, [
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
  ]);
};
