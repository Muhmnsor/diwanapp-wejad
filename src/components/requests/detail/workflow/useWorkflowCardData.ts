
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkflowStep } from "../../types";
import { WorkflowCardDataHookResult } from "./types";
import { diagnoseRequestWorkflow, fixRequestWorkflow } from '../services/requestService';
import { supabase } from "@/integrations/supabase/client";

export const useWorkflowCardData = (
  requestId: string,
  workflow?: { id: string } | null,
  currentStep?: WorkflowStep | null,
  requestStatus: string = 'pending'
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
      
      // For completed requests, set currentStepIndex to indicate completion
      if (requestStatus === 'completed') {
        setCurrentStepIndex(-1); // -1 indicates all steps are complete
        setProgressPercentage(100);
      } else {
        // Find current step index
        const index = currentStep 
          ? steps.findIndex(step => step.id === currentStep.id)
          : -1;
          
        setCurrentStepIndex(index !== -1 ? index : -1);
        
        // Calculate progress percentage more accurately - count all completed steps
        // including opinion steps that have been processed
        const totalSteps = steps.length;
        let completedSteps = 0;
        
        if (index !== -1) {
          // Count steps before current step as completed
          completedSteps = index;
        } else if (index === -1 && !currentStep && requestStatus !== 'pending') {
          // If no current step and request is in_progress, 
          // this could mean all steps are done or workflow is broken
          completedSteps = totalSteps;
        }
        
        const progress = totalSteps > 0 
          ? (completedSteps / totalSteps) * 100
          : 0;
          
        setProgressPercentage(progress);
      }
    }
  }, [steps, currentStep, requestStatus]);

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

  // Function to fix workflow issues
  const fixWorkflow = useCallback(async () => {
    if (!requestId) return null;
    
    try {
      return await fixRequestWorkflow(requestId);
    } catch (error) {
      console.error("Error fixing workflow:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "حدث خطأ أثناء إصلاح مسار العمل"
      };
    }
  }, [requestId]);

  // Function to refresh workflow data
  const refreshWorkflowData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    isLoading,
    error: error as Error | null,
    workflowSteps,
    currentStepIndex,
    progressPercentage,
    diagnoseWorkflow,
    fixWorkflow,
    refreshWorkflowData
  };
};
