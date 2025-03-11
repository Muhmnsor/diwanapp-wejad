
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions to help with workflow operations
 */

/**
 * Checks which workflow steps table is available and returns the name
 */
export const getWorkflowStepsTable = async (): Promise<string> => {
  try {
    const { data: workflowStepsExists } = await supabase.rpc('check_table_exists', { 
      table_name: 'workflow_steps' 
    });
    
    if (workflowStepsExists?.[0]?.table_exists) {
      return 'workflow_steps';
    } else {
      return 'request_workflow_steps';
    }
  } catch (error) {
    console.error('Error checking workflow steps table:', error);
    // Default to workflow_steps if we can't check
    return 'workflow_steps';
  }
};

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
    
    // Determine which table to use for steps
    const stepsTable = await getWorkflowStepsTable();
    console.log(`Using ${stepsTable} table for workflow steps`);
    
    // Get the workflow steps
    const { data: steps, error: stepsError } = await supabase
      .from(stepsTable)
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });
    
    if (stepsError) {
      console.error(`Error fetching workflow steps from ${stepsTable}:`, stepsError);
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
    
    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*, workflow:request_workflows(*)')
      .eq('id', requestId)
      .single();
    
    if (requestError) {
      console.error('Error fetching request:', requestError);
      return { request: null, issues: ['Request not found'] };
    }
    
    if (!request.workflow_id) {
      return { request, issues: ['Request has no workflow assigned'] };
    }
    
    // Check current step
    if (!request.current_step_id) {
      return { 
        request, 
        issues: ['Request has no current step assigned']
      };
    }
    
    // Determine which table to use for steps
    const stepsTable = await getWorkflowStepsTable();
    
    // Get the current step
    const { data: currentStep, error: stepError } = await supabase
      .from(stepsTable)
      .select('*')
      .eq('id', request.current_step_id)
      .single();
    
    if (stepError) {
      return { 
        request, 
        issues: [`Current step not found in ${stepsTable} table`]
      };
    }
    
    return { request, currentStep, issues: [] };
  } catch (error) {
    console.error('Exception in diagnoseRequestWorkflow:', error);
    return { request: null, issues: ['Exception during diagnosis'] };
  }
};

