
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
  requestStatus: 'pending' | 'in_progress' | 'completed' | 'rejected' = 'pending',
  permissions?: { canViewWorkflow?: boolean }
): WorkflowCardDataHookResult => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  // Determine if user has permission to view workflow
  const canViewWorkflow = permissions?.canViewWorkflow !== false;

  // Fetch workflow steps with proper error handling
  const { data: steps, isLoading, error, refetch } = useQuery({
    queryKey: ['workflow-steps', workflow?.id, requestId],
    queryFn: async () => {
      if (!workflow?.id) {
        console.log("No workflow ID provided, skipping steps fetch");
        return [];
      }
      
      if (!canViewWorkflow) {
        console.log("User does not have permission to view workflow");
        setHasPermission(false);
        throw new Error("ليس لديك صلاحية الاطلاع على مسار سير العمل لهذا الطلب");
      }
      
      try {
        console.log(`Fetching workflow steps for workflow ID: ${workflow.id}`);
        const { data, error } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflow.id)
          .order('step_order', { ascending: true });
          
        if (error) {
          console.error("Error fetching workflow steps:", error);
          
          // If it's a permission error, set the permission flag
          if (error.message.includes('permission') || 
              error.code === 'PGRST301' || 
              error.code === '42501') {
            setHasPermission(false);
          }
          
          throw new Error(`خطأ في جلب خطوات سير العمل: ${error.message}`);
        }
        
        console.log(`Retrieved ${data?.length || 0} workflow steps`);
        setHasPermission(true);
        return data as WorkflowStep[];
      } catch (err) {
        console.error("Exception in workflow steps fetch:", err);
        throw err;
      }
    },
    enabled: !!workflow?.id && !!requestId && canViewWorkflow,
    retry: 1,
    retryDelay: 1000
  });

  // Set workflow steps and calculate current step index when data loads
  useEffect(() => {
    if (steps && steps.length > 0) {
      console.log("Setting workflow steps and calculating progress");
      setWorkflowSteps(steps);
      
      // For completed requests, set currentStepIndex to indicate completion
      if (requestStatus === 'completed') {
        setCurrentStepIndex(steps.length); // Set to length to indicate all steps complete
        setProgressPercentage(100);
      } else if (requestStatus === 'rejected') {
        // For rejected requests, find the step where rejection occurred
        const index = currentStep 
          ? steps.findIndex(step => step.id === currentStep.id)
          : -1;
        setCurrentStepIndex(index !== -1 ? index : 0);
        
        // Calculate progress percentage
        const progress = steps.length > 0 
          ? ((index !== -1 ? index : 0) / steps.length) * 100
          : 0;
          
        setProgressPercentage(progress);
      } else {
        // For in-progress requests
        const index = currentStep 
          ? steps.findIndex(step => step.id === currentStep.id)
          : 0;
          
        setCurrentStepIndex(index !== -1 ? index : 0);
        
        // Calculate progress percentage more accurately
        const totalSteps = steps.length;
        const completedSteps = index !== -1 ? index : 0;
        
        const progress = totalSteps > 0 
          ? (completedSteps / totalSteps) * 100
          : 0;
          
        setProgressPercentage(progress);
      }
    } else {
      // Reset state when no steps are available
      console.log("No workflow steps available, resetting state");
      setWorkflowSteps([]);
      setCurrentStepIndex(-1);
      setProgressPercentage(0);
    }
  }, [steps, currentStep, requestStatus]);

  // Function to diagnose workflow issues with better error handling
  const diagnoseWorkflow = useCallback(async () => {
    if (!requestId) {
      console.warn("Cannot diagnose workflow: No request ID provided");
      return null;
    }
    
    if (!hasPermission) {
      console.warn("Cannot diagnose workflow: User lacks permission");
      throw new Error("ليس لديك صلاحية لتشخيص مسار سير العمل لهذا الطلب");
    }
    
    try {
      console.log("Diagnosing workflow for request:", requestId);
      return await diagnoseRequestWorkflow(requestId);
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "حدث خطأ أثناء تشخيص مسار العمل"
      };
    }
  }, [requestId, hasPermission]);

  // Function to fix workflow issues
  const fixWorkflow = useCallback(async () => {
    if (!requestId) {
      console.warn("Cannot fix workflow: No request ID provided");
      return null;
    }
    
    if (!hasPermission) {
      console.warn("Cannot fix workflow: User lacks permission");
      throw new Error("ليس لديك صلاحية لإصلاح مسار سير العمل لهذا الطلب");
    }
    
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
  }, [requestId, hasPermission]);

  // Function to refresh workflow data
  const refreshWorkflowData = useCallback(async () => {
    console.log("Refreshing workflow data");
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
    refreshWorkflowData,
    hasPermission
  };
};
