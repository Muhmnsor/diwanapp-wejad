
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowCardDataHookResult } from './types';
import { WorkflowStep } from '../../types';
import { toast } from 'sonner';
import { debugWorkflowStatus, fixRequestWorkflow } from '../services/requestService';

export const useWorkflowCardData = (
  workflowId?: string, 
  requestId?: string,
  currentStepId?: string
): WorkflowCardDataHookResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [progressPercentage, setProgressPercentage] = useState(0);
  
  const fetchWorkflowData = useCallback(async () => {
    if (!workflowId || !requestId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching workflow data for workflow: ${workflowId}, request: ${requestId}`);
      
      // Get workflow steps
      const { data: steps, error: stepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });
        
      if (stepsError) {
        throw new Error(`Error fetching workflow steps: ${stepsError.message}`);
      }
      
      if (!steps || steps.length === 0) {
        throw new Error('لا توجد خطوات محددة لمسار سير العمل هذا');
      }
      
      // Get approved steps for this request to calculate progress
      const { data: approvals, error: approvalsError } = await supabase
        .from('request_approvals')
        .select('step_id, status')
        .eq('request_id', requestId)
        .eq('status', 'approved');
        
      if (approvalsError) {
        console.error("Error fetching approvals:", approvalsError);
        // Continue without approvals data
      }
      
      // Find current step index
      const currentIndex = steps.findIndex(step => step.id === currentStepId);
      setCurrentStepIndex(currentIndex !== -1 ? currentIndex : 0);
      
      // Calculate completion percentage based on approved steps
      // Only count decision steps for progress calculation
      const decisionSteps = steps.filter(step => step.step_type === 'decision');
      const approvedStepIds = approvals ? approvals.map(a => a.step_id) : [];
      
      const approvedDecisionSteps = decisionSteps.filter(step => 
        approvedStepIds.includes(step.id)
      );
      
      const progress = decisionSteps.length > 0
        ? (approvedDecisionSteps.length / decisionSteps.length) * 100
        : 0;
      
      setWorkflowSteps(steps);
      setProgressPercentage(progress);
      
    } catch (err) {
      console.error('Error in fetchWorkflowData:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, requestId, currentStepId]);
  
  useEffect(() => {
    fetchWorkflowData();
  }, [fetchWorkflowData]);
  
  const diagnoseWorkflow = async () => {
    if (!requestId) {
      toast.error("معرف الطلب غير متوفر");
      return null;
    }
    
    try {
      const result = await debugWorkflowStatus(requestId);
      return result;
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      toast.error("حدث خطأ أثناء تشخيص مسار سير العمل");
      return null;
    }
  };
  
  const fixWorkflow = async () => {
    if (!requestId) {
      toast.error("معرف الطلب غير متوفر");
      return null;
    }
    
    try {
      const result = await fixRequestWorkflow(requestId);
      if (result && result.success) {
        await fetchWorkflowData(); // Refresh data after fixing
      }
      return result;
    } catch (error) {
      console.error("Error fixing workflow:", error);
      toast.error("حدث خطأ أثناء إصلاح مسار سير العمل");
      return null;
    }
  };
  
  const refreshWorkflowData = async () => {
    await fetchWorkflowData();
  };
  
  return {
    isLoading,
    error,
    workflowSteps,
    currentStepIndex,
    progressPercentage,
    diagnoseWorkflow,
    fixWorkflow,
    refreshWorkflowData
  };
};
