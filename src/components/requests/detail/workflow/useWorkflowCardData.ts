import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkflowStep } from "../../types";
import { diagnoseRequestWorkflow } from '../services/requestService';
import { supabase } from "@/integrations/supabase/client";

export const useWorkflowCardData = (
  requestId: string,
  workflow?: { id: string } | null,
  currentStep?: WorkflowStep | null
) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);

  // Fetch workflow steps
  const { data: steps, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-steps', workflow?.id],
    queryFn: async () => {
      if (!workflow?.id) return [];
      
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflow.id)
        .order('step_order', { ascending: true });
        
      if (error) throw error;
      return data as WorkflowStep[];
    },
    enabled: !!workflow?.id
  });

  // Set workflow steps when data is loaded
  useEffect(() => {
    if (steps && steps.length > 0) {
      setWorkflowSteps(steps);
      
      // Find current step index
      if (currentStep) {
        const index = steps.findIndex(step => step.id === currentStep.id);
        setCurrentStepIndex(index !== -1 ? index : -1);
      }
    }
  }, [steps, currentStep]);

  // Function to diagnose workflow issues
  const diagnoseWorkflow = async () => {
    if (!requestId) return null;
    
    try {
      return await diagnoseRequestWorkflow(requestId);
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      return null;
    }
  };

  return {
    isLoading,
    error,
    workflowSteps,
    currentStepIndex,
    diagnoseWorkflow,
    refreshWorkflowData: refetch
  };
};
