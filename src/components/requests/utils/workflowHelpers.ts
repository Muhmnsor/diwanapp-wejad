
import { supabase } from '@/integrations/supabase/client';
import { validateWorkflow, validateRequestType, validateAndRepairRequest, repairWorkflow } from './workflowValidator';

/**
 * Utility functions to help with workflow operations
 */

/**
 * Fetches a request workflow by ID and logs diagnostic information
 */
export const fetchWorkflowDetails = async (workflowId: string) => {
  try {
    console.log(`Fetching workflow details for ID: ${workflowId}`);
    
    // Get the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();
    
    if (workflowError) {
      console.error('Error fetching workflow:', workflowError);
      return null;
    }
    
    // Get the workflow steps - UPDATED: check both tables for compatibility
    let steps = [];
    
    // First try the workflow_steps table (new structure)
    const { data: newSteps, error: newStepsError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });
    
    if (!newStepsError && newSteps && newSteps.length > 0) {
      steps = newSteps;
    } else {
      // If no steps in the new table, try the legacy table
      const { data: legacySteps, error: legacyStepsError } = await supabase
        .from('request_workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });
      
      if (!legacyStepsError && legacySteps && legacySteps.length > 0) {
        steps = legacySteps;
      }
    }
    
    console.log(`Workflow found with ${steps?.length || 0} steps`);
    return { workflow, steps };
  } catch (error) {
    console.error('Exception in fetchWorkflowDetails:', error);
    return null;
  }
};

/**
 * Fetches requests that are linked to a specific workflow
 */
export const fetchRequestsByWorkflow = async (workflowId: string) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('workflow_id', workflowId);
    
    if (error) {
      console.error('Error fetching requests by workflow:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Exception in fetchRequestsByWorkflow:', error);
    return [];
  }
};

/**
 * Diagnoses issues with a particular request's workflow
 */
export const diagnoseRequestWorkflow = async (requestId: string) => {
  try {
    console.log(`Diagnosing workflow for request ID: ${requestId}`);
    
    // Use the new validation function which handles edge cases better
    const validationResult = await validateAndRepairRequest(requestId);
    
    // Add information about whether the workflow can be repaired automatically
    const canBeRepaired = !validationResult.valid && !validationResult.repaired;
    
    if (validationResult && validationResult.validationResult) {
      validationResult.validationResult.canBeRepaired = canBeRepaired;
    }
    
    return {
      request: validationResult.request,
      currentStep: validationResult.currentStep,
      issues: validationResult.valid ? [] : [validationResult.error],
      validationResult
    };
  } catch (error) {
    console.error('Exception in diagnoseRequestWorkflow:', error);
    return { request: null, issues: ['Exception during diagnosis'] };
  }
};

/**
 * A utility to check if a request is properly associated with a workflow
 */
export const validateRequestWorkflow = async (requestTypeId: string): Promise<boolean> => {
  try {
    // Use the enhanced validation function
    const validationResult = await validateRequestType(requestTypeId);
    return validationResult.valid;
  } catch (error) {
    console.error('Exception in validateRequestWorkflow:', error);
    return false;
  }
};

// Expose additional validation functions from workflowValidator
export { validateWorkflow, validateRequestType, validateAndRepairRequest, repairWorkflow } from './workflowValidator';
