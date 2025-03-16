import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowStep } from '../../types';
import { WorkflowCardDataHookResult } from './types';
import { toast } from 'sonner';

export const useWorkflowCardData = (
  workflowId: string | null | undefined,
  requestId: string | null | undefined,
  requestStatus?: string
): WorkflowCardDataHookResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [hasPermission, setHasPermission] = useState(true);

  // Load workflow steps
  useEffect(() => {
    const loadWorkflowSteps = async () => {
      if (!workflowId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
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
        
        // Transform data to include approver_name from the joined users table
        const transformedSteps = data.map(step => {
          // Handle the nested users object
          const approverName = step.users && typeof step.users === 'object' ? 
                              (step.users as any).display_name : null;
          
          return {
            ...step,
            approver_name: approverName,
            users: undefined
          };
        });
        
        setWorkflowSteps(transformedSteps as WorkflowStep[]);
        
        // Get current step index from request data
        if (requestId) {
          const { data: requestData, error: requestError } = await supabase
            .from('requests')
            .select('current_step_id')
            .eq('id', requestId)
            .single();
            
          if (requestError) {
            if (requestError.code === 'PGRST116') {
              setHasPermission(false);
            } else {
              throw requestError;
            }
          }
          
          if (requestData && requestData.current_step_id) {
            const currentIndex = transformedSteps.findIndex(step => step.id === requestData.current_step_id);
            setCurrentStepIndex(currentIndex >= 0 ? currentIndex : 0);
            
            // Calculate progress percentage
            if (transformedSteps.length > 0) {
              const progress = ((currentIndex + 1) / transformedSteps.length) * 100;
              setProgressPercentage(Math.min(progress, 100));
            }
          } else if (transformedSteps.length > 0) {
            // No current step, but we have workflow steps, assume it's at the beginning
            setCurrentStepIndex(0);
            setProgressPercentage(0);
          }
        }
      } catch (err) {
        console.error('Error loading workflow steps:', err);
        setError(err instanceof Error ? err : new Error('Failed to load workflow data'));
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWorkflowSteps();
  }, [workflowId, requestId]);
  
  // Calculate progress percentage if requestStatus or currentStepIndex changes
  useEffect(() => {
    if (requestStatus === 'completed') {
      setProgressPercentage(100);
    } else if (requestStatus === 'rejected') {
      // Don't change the progress, keep it at the rejected step
    } else if (workflowSteps.length > 0) {
      const progress = ((currentStepIndex + 1) / workflowSteps.length) * 100;
      setProgressPercentage(Math.min(progress, 100));
    }
  }, [requestStatus, currentStepIndex, workflowSteps.length]);
  
  // Diagnose workflow issues
  const diagnoseWorkflow = useCallback(async () => {
    if (!requestId || !workflowId) return null;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('diagnose_request_workflow', {
        p_request_id: requestId,
        p_workflow_id: workflowId
      });
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error diagnosing workflow:', err);
      toast.error('Failed to diagnose workflow issues');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [requestId, workflowId]);
  
  // Fix workflow issues
  const fixWorkflow = useCallback(async () => {
    if (!requestId || !workflowId) return false;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.rpc('fix_request_workflow', {
        p_request_id: requestId
      });
      
      if (error) throw error;
      
      toast.success('Workflow fixes applied successfully');
      return true;
    } catch (err) {
      console.error('Error fixing workflow:', err);
      toast.error('Failed to fix workflow issues');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [requestId, workflowId]);
  
  // Refresh workflow data
  const refreshWorkflowData = useCallback(async () => {
    if (!workflowId) return false;
    
    try {
      setIsLoading(true);
      
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
      
      // Transform data to include approver_name from the joined users table
      const transformedSteps = data.map(step => {
        // Handle the nested users object properly
        const approverName = step.users && typeof step.users === 'object' ? 
                            (step.users as any).display_name : null;
        
        return {
          ...step,
          approver_name: approverName,
          users: undefined
        };
      });
      
      setWorkflowSteps(transformedSteps as WorkflowStep[]);
      
      // Get current step index from request data
      if (requestId) {
        const { data: requestData, error: requestError } = await supabase
          .from('requests')
          .select('current_step_id, status')
          .eq('id', requestId)
          .single();
          
        if (requestError) throw requestError;
        
        if (requestData) {
          // Update current step index
          if (requestData.current_step_id) {
            const currentIndex = transformedSteps.findIndex(step => step.id === requestData.current_step_id);
            setCurrentStepIndex(currentIndex >= 0 ? currentIndex : 0);
          }
          
          // Calculate progress percentage
          if (transformedSteps.length > 0) {
            if (requestData.status === 'completed') {
              setProgressPercentage(100);
            } else {
              const progress = ((currentStepIndex + 1) / transformedSteps.length) * 100;
              setProgressPercentage(Math.min(progress, 100));
            }
          }
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error refreshing workflow data:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh workflow data'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, requestId, currentStepIndex]);
  
  return {
    isLoading,
    error,
    workflowSteps,
    currentStepIndex,
    progressPercentage,
    diagnoseWorkflow,
    fixWorkflow,
    refreshWorkflowData,
    hasPermission
  };
};
