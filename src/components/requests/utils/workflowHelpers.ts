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
    
    // Get the workflow steps
    const { data: steps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });
    
    if (stepsError) {
      console.error('Error fetching workflow steps:', stepsError);
      return { workflow, steps: [] };
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

/**
 * Checks if a request type has any dependencies (associated workflows or requests)
 * @param requestTypeId The ID of the request type to check
 * @returns Object containing workflows and requests associated with the type
 */
export const checkRequestTypeDependencies = async (requestTypeId: string) => {
  try {
    console.log(`Checking dependencies for request type ID: ${requestTypeId}`);
    
    // Get workflows for this request type
    const { data: workflows, error: workflowsError } = await supabase
      .from('request_workflows')
      .select('*')
      .eq('request_type_id', requestTypeId);

    if (workflowsError) throw workflowsError;

    // Get requests for this request type
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('*')
      .eq('request_type_id', requestTypeId);

    if (requestsError) throw requestsError;

    return {
      workflows: workflows || [],
      requests: requests || [],
      hasWorkflows: workflows && workflows.length > 0,
      hasRequests: requests && requests.length > 0,
    };
  } catch (error) {
    console.error("Error checking request type dependencies:", error);
    throw error;
  }
};

/**
 * Utility to check if workflow steps can be properly deleted
 */
export const verifyWorkflowStepDeletion = async (workflowId: string) => {
  try {
    console.log(`Verifying workflow step deletion for workflow ID: ${workflowId}`);
    
    // First get existing steps to verify they exist
    const { data: existingSteps, error: getError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId);
    
    if (getError) {
      console.error('Error fetching existing steps:', getError);
      return {
        success: false,
        message: `Error fetching existing steps: ${getError.message}`,
        existingSteps: []
      };
    }
    
    console.log(`Found ${existingSteps?.length || 0} existing steps`);
    
    // Try to delete the steps using RPC
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('insert_workflow_steps', {
        steps: []
      });
      
    if (rpcError) {
      console.error('Error deleting workflow steps via RPC:', rpcError);
      return {
        success: false,
        message: `Error deleting steps: ${rpcError.message}`,
        existingSteps
      };
    }
    
    // Now check if steps were actually deleted
    const { data: remainingSteps, error: checkError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId);
    
    if (checkError) {
      console.error('Error checking remaining steps:', checkError);
      return {
        success: false,
        message: `Error checking remaining steps: ${checkError.message}`,
        existingSteps
      };
    }
    
    const success = !remainingSteps || remainingSteps.length === 0;
    
    return {
      success,
      message: success 
        ? 'Successfully deleted all workflow steps' 
        : `Failed to delete ${remainingSteps?.length} steps`,
      existingSteps,
      remainingSteps
    };
  } catch (error) {
    console.error('Exception in verifyWorkflowStepDeletion:', error);
    return {
      success: false,
      message: `Exception: ${error.message}`,
      error
    };
  }
};

// Expose additional validation functions from workflowValidator
export { validateWorkflow, validateRequestType, validateAndRepairRequest, repairWorkflow } from './workflowValidator';
