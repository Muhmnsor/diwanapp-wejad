
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkflowStep } from "../../types";
import { WorkflowCardDataHookResult } from "./types";
import { diagnoseRequestWorkflow } from '../services/requestService';
import { supabase } from "@/integrations/supabase/client";

export const useWorkflowCardData = (
  requestId: string,
  workflow?: { id: string } | null,
  currentStep?: WorkflowStep | null
): WorkflowCardDataHookResult => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);

  // Fetch workflow steps with proper error handling
  const { data: steps, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-steps', workflow?.id, requestId],
    queryFn: async () => {
      if (!workflow?.id) return [];
      
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflow.id)
        .order('step_order', { ascending: true });
        
      if (error) throw new Error(`Error fetching workflow steps: ${error.message}`);
      return data as WorkflowStep[];
    },
    enabled: !!workflow?.id && !!requestId
  });

  // Set workflow steps and calculate current step index when data loads
  useEffect(() => {
    if (steps && steps.length > 0) {
      setWorkflowSteps(steps);
      
      // Find current step index
      const index = currentStep 
        ? steps.findIndex(step => step.id === currentStep.id)
        : -1;
        
      setCurrentStepIndex(index !== -1 ? index : -1);
      
      // Calculate progress percentage
      const totalSteps = steps.length;
      const completedSteps = index !== -1 ? index : totalSteps;
      const progress = totalSteps > 0 
        ? (completedSteps / totalSteps) * 100
        : 0;
        
      setProgressPercentage(progress);
    }
  }, [steps, currentStep]);

  // Function to diagnose workflow issues with better error handling
  const diagnoseWorkflow = useCallback(async () => {
    if (!requestId) return null;
    
    try {
      return await diagnoseRequestWorkflow(requestId);
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "حدث خطأ أثناء تشخيص مسار العمل"
      };
    }
  }, [requestId]);

  // Function to refresh workflow data
  const refreshWorkflowData = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    isLoading,
    error: error as Error | null,
    workflowSteps,
    currentStepIndex,
    progressPercentage,
    diagnoseWorkflow,
    refreshWorkflowData
  };
};
