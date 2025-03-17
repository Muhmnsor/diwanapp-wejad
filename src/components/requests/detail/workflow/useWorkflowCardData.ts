
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
        .select('*, approver:approver_id(id, display_name, email)')
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
        .select('step_id, status, approver_id')
        .eq('request_id', requestId);
        
      if (approvalsError) {
        console.error("Error fetching approvals:", approvalsError);
        // Continue without approvals data
      }
      
      // Find current step index based on step order
      const currentStep = steps.find(step => step.id === currentStepId);
      const currentStepOrder = currentStep?.step_order || 0;
      
      // Find the index based on order - if multiple steps have the same order, use the first one
      const currentOrderIndex = steps
        .filter((step, index, self) => 
          // Filter unique step_order values
          index === self.findIndex(s => s.step_order === step.step_order)
        )
        .findIndex(step => step.step_order === currentStepOrder);
        
      setCurrentStepIndex(currentOrderIndex !== -1 ? currentOrderIndex : 0);
      
      // Calculate completion percentage based on completed steps and step ordering
      // Group steps by step_order
      const stepsByOrder: Record<number, WorkflowStep[]> = {};
      steps.forEach(step => {
        const order = step.step_order || 0;
        if (!stepsByOrder[order]) {
          stepsByOrder[order] = [];
        }
        stepsByOrder[order].push(step);
      });
      
      // Consider a step_order complete if all required steps at that order are approved
      const orderValues = Object.keys(stepsByOrder).map(k => parseInt(k)).sort((a, b) => a - b);
      const totalOrders = orderValues.length;
      
      let completedOrders = 0;
      
      // Count completed orders
      orderValues.forEach(order => {
        const stepsAtThisOrder = stepsByOrder[order];
        const decisionStepsAtThisOrder = stepsAtThisOrder.filter(step => 
          step.step_type === 'decision'
        );
        
        // If there are no decision steps at this order, it's just opinion steps
        if (decisionStepsAtThisOrder.length === 0) {
          completedOrders += 1;
          return;
        }
        
        // Check if all decision steps at this order are approved
        const allDecisionStepsApproved = decisionStepsAtThisOrder.every(step => 
          approvals?.some(
            approval => approval.step_id === step.id && approval.status === 'approved'
          )
        );
        
        if (allDecisionStepsApproved) {
          completedOrders += 1;
        }
      });
      
      // Calculate progress percentage
      const progress = totalOrders > 0
        ? (completedOrders / totalOrders) * 100
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
