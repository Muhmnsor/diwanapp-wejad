
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

  // Fetch completed approvals for this request to calculate accurate progress
  const { data: approvals } = useQuery({
    queryKey: ['workflow-approvals', requestId],
    queryFn: async () => {
      if (!requestId) return [];
      
      const { data, error } = await supabase
        .from('request_approvals')
        .select('step_id, status')
        .eq('request_id', requestId);
        
      if (error) throw new Error(`Error fetching approvals: ${error.message}`);
      return data;
    },
    enabled: !!requestId
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
          
        console.log("Current step info:", { 
          currentStepId: currentStep?.id,
          foundIndex: index,
          stepsCount: steps.length,
          stepsIds: steps.map(s => s.id)
        });
        
        setCurrentStepIndex(index !== -1 ? index : -1);
        
        // Calculate progress percentage more accurately by counting approved steps
        calculateProgress(steps, approvals || [], index, requestStatus);
      }
    }
  }, [steps, currentStep, requestStatus, approvals]);

  // Calculate progress based on approved steps rather than just step index
  const calculateProgress = (
    workflowSteps: WorkflowStep[], 
    approvals: { step_id: string, status: string }[], 
    currentIndex: number,
    status: string
  ) => {
    if (workflowSteps.length === 0) {
      setProgressPercentage(0);
      return;
    }
    
    // Count total decision steps (they're the ones that affect progress)
    const totalDecisionSteps = workflowSteps.filter(
      step => step.step_type === 'decision' || !step.step_type
    ).length;
    
    // Count completed decision steps
    const completedDecisionStepsCount = workflowSteps.filter((step, index) => {
      // A step is completed if:
      // 1. It's a decision step AND
      // 2. Either it has an approved approval OR it comes before the current step
      const isDecisionStep = step.step_type === 'decision' || !step.step_type;
      const isApproved = approvals.some(
        a => a.step_id === step.id && a.status === 'approved'
      );
      const isBeforeCurrent = index < currentIndex;
      
      return isDecisionStep && (isApproved || isBeforeCurrent);
    }).length;
    
    // Calculate progress - if no decision steps, use all steps
    let progress = 0;
    if (totalDecisionSteps > 0) {
      progress = (completedDecisionStepsCount / totalDecisionSteps) * 100;
    } else if (workflowSteps.length > 0) {
      // Fall back to index-based calculation if no decision steps
      const completedCount = currentIndex >= 0 ? currentIndex : 0;
      progress = (completedCount / workflowSteps.length) * 100;
    }
    
    // If status is completed, always show 100%
    if (status === 'completed') {
      progress = 100;
    }
    
    setProgressPercentage(progress);
  };

  // Function to diagnose workflow issues with better error handling
  const diagnoseWorkflow = useCallback(async () => {
    if (!requestId) return null;
    
    try {
      console.log("Running workflow diagnostics for request:", requestId);
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
      console.log("Fixing workflow for request:", requestId);
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
    console.log("Refreshing workflow data for request:", requestId);
    await refetch();
  }, [refetch, requestId]);

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
