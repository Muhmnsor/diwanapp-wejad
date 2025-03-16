
import { useState, useEffect } from 'react';
import { WorkflowStep } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowCardDataHookResult } from './types';

interface WorkflowPermissions {
  canViewWorkflow?: boolean;
  isRequester?: boolean;
  isAdmin?: boolean;
  isInWorkflow?: boolean;
}

export const useWorkflowCardData = (
  requestId: string,
  workflow: { 
    id: string; 
    name?: string; 
    description?: string; 
    is_active?: boolean;
    steps?: WorkflowStep[];
  } | null,
  currentStep: WorkflowStep | null,
  requestStatus: 'pending' | 'in_progress' | 'completed' | 'rejected',
  permissions: WorkflowPermissions = {}
): WorkflowCardDataHookResult => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(workflow?.steps || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Extract the permission flag
  const hasPermission = permissions.canViewWorkflow !== false;
  
  useEffect(() => {
    if (workflow?.id && hasPermission) {
      fetchWorkflowSteps(workflow.id);
    } else if (workflow?.steps && hasPermission) {
      setWorkflowSteps(workflow.steps);
    }
  }, [workflow?.id, hasPermission]);
  
  const fetchWorkflowSteps = async (workflowId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select(`
          id, step_name, step_type, approver_id, is_required, 
          step_order, instructions, workflow_id,
          users:approver_id (id, display_name)
        `)
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });
      
      if (error) throw error;
      
      // Process steps with users join
      const transformedSteps = data.map(step => {
        let approverName = null;
        if (step.users) {
          approverName = step.users.display_name || null;
        }
        
        return {
          ...step,
          approver_name: approverName,
          users: undefined
        };
      });
      
      setWorkflowSteps(transformedSteps);
    } catch (err) {
      console.error('Error fetching workflow steps:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch workflow steps'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate progress percentage based on steps
  const calculateProgressPercentage = (): number => {
    if (!workflowSteps.length) return 0;
    
    if (requestStatus === 'completed') return 100;
    if (requestStatus === 'rejected') {
      // If rejected, calculate how far it got
      const currentStepIndex = findCurrentStepIndex();
      if (currentStepIndex === -1) return 0;
      return Math.round((currentStepIndex / workflowSteps.length) * 100);
    }
    
    const currentStepIndex = findCurrentStepIndex();
    if (currentStepIndex === -1) return 0;
    
    // Calculate percentage based on current step position
    return Math.round((currentStepIndex / workflowSteps.length) * 100);
  };
  
  // Find the index of the current step in the workflow
  const findCurrentStepIndex = (): number => {
    if (!currentStep || !currentStep.id) return 0;
    
    const index = workflowSteps.findIndex(step => step.id === currentStep.id);
    return index;
  };
  
  // Service functions for diagnostics and fixes
  const diagnoseWorkflow = async () => {
    if (!requestId) {
      return { success: false, error: "No request ID provided" };
    }
    
    try {
      const { data, error } = await supabase
        .rpc('debug_workflow_status', { p_request_id: requestId });
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error diagnosing workflow:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };
  
  const fixWorkflow = async () => {
    if (!requestId) {
      return { success: false, error: "No request ID provided" };
    }
    
    try {
      const { data, error } = await supabase
        .rpc('fix_request_workflow', { p_request_id: requestId });
        
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error fixing workflow:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  };
  
  const refreshWorkflowData = async () => {
    if (workflow?.id) {
      await fetchWorkflowSteps(workflow.id);
      return { success: true };
    }
    return { success: false, error: "No workflow ID available for refresh" };
  };
  
  return {
    isLoading,
    error,
    workflowSteps,
    currentStepIndex: findCurrentStepIndex(),
    progressPercentage: calculateProgressPercentage(),
    diagnoseWorkflow,
    fixWorkflow,
    refreshWorkflowData,
    hasPermission
  };
};
