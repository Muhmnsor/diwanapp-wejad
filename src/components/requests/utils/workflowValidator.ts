import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Validates if a workflow has properly configured steps
 * @param workflowId The ID of the workflow to validate
 * @returns A promise resolving to an object containing validation results
 */
export const validateWorkflow = async (workflowId: string) => {
  try {
    // Check if workflow exists
    const { data: workflow, error: workflowError } = await supabase
      .from('request_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();
    
    if (workflowError) {
      console.error('Error validating workflow:', workflowError);
      return { 
        valid: false, 
        workflow: null, 
        steps: [], 
        error: 'Workflow not found',
        issues: ['Workflow does not exist'] 
      };
    }
    
    // Check if workflow has steps
    const { data: steps, error: stepsError } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('step_order', { ascending: true });
    
    if (stepsError) {
      console.error('Error checking workflow steps:', stepsError);
      return { 
        valid: false, 
        workflow, 
        steps: [], 
        error: 'Error checking workflow steps',
        issues: ['Failed to retrieve workflow steps'] 
      };
    }
    
    const issues = [];
    
    // Check if workflow has any steps
    if (!steps || steps.length === 0) {
      issues.push('Workflow has no steps configured');
      return { 
        valid: false, 
        workflow, 
        steps: [], 
        issues,
        error: 'No steps found for this workflow' 
      };
    }
    
    // Check each step for valid approver
    const stepsWithIssues = steps.filter(step => !step.approver_id);
    if (stepsWithIssues.length > 0) {
      issues.push(`${stepsWithIssues.length} step(s) are missing approver(s)`);
    }
    
    // Check step order continuity
    const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);
    for (let i = 0; i < sortedSteps.length - 1; i++) {
      if (sortedSteps[i + 1].step_order - sortedSteps[i].step_order > 1) {
        issues.push('Step order is not continuous');
        break;
      }
    }
    
    return {
      valid: issues.length === 0,
      workflow,
      steps,
      issues,
      error: issues.length > 0 ? 'Workflow has configuration issues' : null
    };
  } catch (error) {
    console.error('Exception in validateWorkflow:', error);
    return {
      valid: false,
      workflow: null,
      steps: [],
      issues: ['Exception occurred during validation'],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Ensures a request is attached to a valid workflow step
 * @param requestId The ID of the request to validate
 * @returns A promise resolving to an object containing validation and repair results
 */
export const validateAndRepairRequest = async (requestId: string) => {
  try {
    // Fetch the request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*, workflow:request_workflows(*)')
      .eq('id', requestId)
      .single();
    
    if (requestError) {
      console.error('Error fetching request:', requestError);
      return { 
        valid: false, 
        repaired: false, 
        request: null, 
        error: 'Request not found' 
      };
    }
    
    // If request has no workflow, it's not valid for workflow processing
    if (!request.workflow_id) {
      return { 
        valid: false, 
        repaired: false, 
        request, 
        error: 'Request has no associated workflow' 
      };
    }
    
    // Validate the workflow
    const workflowValidation = await validateWorkflow(request.workflow_id);
    if (!workflowValidation.valid) {
      return { 
        valid: false, 
        repaired: false, 
        request, 
        workflow: workflowValidation.workflow,
        error: `Invalid workflow: ${workflowValidation.error}`,
        issues: workflowValidation.issues
      };
    }
    
    const steps = workflowValidation.steps;
    
    // Validate the current step
    let needsRepair = false;
    let repairMessage = '';
    let currentStep = null;
    
    if (!request.current_step_id) {
      needsRepair = true;
      repairMessage = 'Request has no current step';
    } else {
      // Check if current step exists in workflow steps
      currentStep = steps.find(step => step.id === request.current_step_id);
      if (!currentStep) {
        needsRepair = true;
        repairMessage = 'Current step does not belong to the workflow';
      }
    }
    
    // If repair is needed and steps exist, set to first step
    if (needsRepair && steps.length > 0) {
      const firstStep = steps[0];
      
      // Update the request with the first step
      const { data: updatedRequest, error: updateError } = await supabase
        .from('requests')
        .update({ current_step_id: firstStep.id })
        .eq('id', requestId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error repairing request:', updateError);
        return { 
          valid: false, 
          repaired: false, 
          request, 
          error: `Failed to repair request: ${updateError.message}` 
        };
      }
      
      // Log the repair operation
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'repair_request',
          p_request_type_id: request.request_type_id,
          p_workflow_id: request.workflow_id,
          p_step_id: firstStep.id,
          p_request_data: { original_step_id: request.current_step_id },
          p_response_data: { new_step_id: firstStep.id },
          p_details: `Repaired request by setting current step to first workflow step. Reason: ${repairMessage}`
        });
      } catch (logError) {
        console.error('Failed to log repair operation:', logError);
      }
      
      return { 
        valid: true, 
        repaired: true, 
        request: updatedRequest, 
        originalRequest: request,
        currentStep: firstStep,
        repairMessage: `Request repaired: ${repairMessage}. Set to first step: ${firstStep.step_name}`
      };
    }
    
    // Request is valid
    return { 
      valid: true, 
      repaired: false, 
      request,
      currentStep 
    };
  } catch (error) {
    console.error('Exception in validateAndRepairRequest:', error);
    return { 
      valid: false, 
      repaired: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Ensures a request type has a valid default workflow
 * @param requestTypeId The ID of the request type to validate
 * @returns A promise resolving to validation result
 */
export const validateRequestType = async (requestTypeId: string) => {
  try {
    // Get the request type
    const { data: requestType, error: typeError } = await supabase
      .from('request_types')
      .select('*, default_workflow:request_workflows(*)')
      .eq('id', requestTypeId)
      .single();
    
    if (typeError) {
      console.error('Error fetching request type:', typeError);
      return { 
        valid: false, 
        requestType: null, 
        error: 'Request type not found' 
      };
    }
    
    // Check if request type has a default workflow
    if (!requestType.default_workflow_id) {
      return { 
        valid: false, 
        requestType, 
        error: 'Request type has no default workflow',
        issues: ['No default workflow configured'] 
      };
    }
    
    // Validate the default workflow
    const workflowValidation = await validateWorkflow(requestType.default_workflow_id);
    
    return {
      valid: workflowValidation.valid,
      requestType,
      workflow: workflowValidation.workflow,
      steps: workflowValidation.steps,
      issues: workflowValidation.issues,
      error: workflowValidation.error
    };
  } catch (error) {
    console.error('Exception in validateRequestType:', error);
    return { 
      valid: false, 
      requestType: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Scans and repairs all requests that have workflow issues
 * @returns A promise resolving to the repair results
 */
export const repairAllRequestWorkflows = async () => {
  try {
    // Start by getting all requests with workflows
    const { data: requests, error: requestsError } = await supabase
      .from('requests')
      .select('id, workflow_id, current_step_id')
      .not('workflow_id', 'is', null);
    
    if (requestsError) {
      console.error('Error fetching requests:', requestsError);
      return { 
        success: false, 
        error: 'Failed to fetch requests', 
        repairedCount: 0 
      };
    }
    
    console.log(`Found ${requests?.length || 0} requests with workflows to check`);
    const results = {
      checked: 0,
      repairedCount: 0,
      failed: 0,
      skipCount: 0,
      repairedRequests: [] as any[]
    };
    
    // Process each request
    for (const request of requests || []) {
      results.checked++;
      
      // Skip requests that already have a current step
      if (request.current_step_id) {
        results.skipCount++;
        continue;
      }
      
      try {
        const validationResult = await validateAndRepairRequest(request.id);
        if (validationResult.repaired) {
          results.repairedCount++;
          results.repairedRequests.push({
            id: request.id,
            message: validationResult.repairMessage
          });
        }
      } catch (error) {
        console.error(`Error validating request ${request.id}:`, error);
        results.failed++;
      }
    }
    
    return {
      success: true,
      results,
      message: `Checked ${results.checked} requests, repaired ${results.repairedCount}, failed ${results.failed}, skipped ${results.skipCount}`
    };
  } catch (error) {
    console.error('Exception in repairAllRequestWorkflows:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      repairedCount: 0 
    };
  }
};

/**
 * Validates a new request data before creation to ensure it has a valid workflow and step
 * @param requestData The request data object
 * @returns A promise resolving to validation result
 */
export const validateNewRequest = async (requestData: any) => {
  try {
    // Check if request type exists
    if (!requestData.request_type_id) {
      return {
        valid: false,
        error: 'Request type ID is required'
      };
    }
    
    // Validate the request type
    const typeValidation = await validateRequestType(requestData.request_type_id);
    if (!typeValidation.valid) {
      return {
        valid: false,
        error: `Invalid request type: ${typeValidation.error}`,
        requestType: typeValidation.requestType,
        issues: typeValidation.issues
      };
    }
    
    // Ensure workflow_id is set from default workflow if not provided
    if (!requestData.workflow_id && typeValidation.requestType?.default_workflow_id) {
      requestData.workflow_id = typeValidation.requestType.default_workflow_id;
    }
    
    // Check if workflow is provided
    if (!requestData.workflow_id) {
      return {
        valid: false,
        error: 'No workflow specified and no default workflow available'
      };
    }
    
    // Validate the workflow
    const workflowValidation = await validateWorkflow(requestData.workflow_id);
    if (!workflowValidation.valid) {
      return {
        valid: false,
        error: `Invalid workflow: ${workflowValidation.error}`,
        workflow: workflowValidation.workflow,
        issues: workflowValidation.issues
      };
    }
    
    // Set the current_step_id to the first step if not specified
    if (!requestData.current_step_id && workflowValidation.steps.length > 0) {
      requestData.current_step_id = workflowValidation.steps[0].id;
    }
    
    return {
      valid: true,
      requestData,
      workflow: workflowValidation.workflow,
      steps: workflowValidation.steps
    };
  } catch (error) {
    console.error('Exception in validateNewRequest:', error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Repairs a specific workflow by recreating missing steps or updating incorrect ones
 * @param workflowId The ID of the workflow to repair
 * @returns A promise resolving to the repair results
 */
export const repairWorkflow = async (workflowId: string) => {
  // First validate the workflow
  const validation = await validateWorkflow(workflowId);
  
  // If the workflow is valid, no repair needed
  if (validation.valid) {
    return {
      success: true,
      repaired: false,
      message: 'Workflow is already valid, no repair needed',
      workflow: validation.workflow,
      steps: validation.steps
    };
  }
  
  // If workflow doesn't exist or has other critical issues, can't repair
  if (!validation.workflow) {
    return {
      success: false,
      repaired: false,
      error: 'Cannot repair: workflow does not exist'
    };
  }
  
  try {
    // If there are no steps, create a default step
    if (!validation.steps || validation.steps.length === 0) {
      // Get all admin users to use as possible approvers
      const rolesQuery = await supabase
        .from('roles')
        .select('id')
        .in('name', ['admin', 'app_admin']);
        
      if (!rolesQuery.data) {
        return {
          success: false,
          repaired: false,
          error: 'Cannot repair: failed to fetch admin roles'
        };
      }
      
      const roleIds = rolesQuery.data.map(r => r.id);
      
      const userRolesQuery = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role_id', roleIds);
        
      if (!userRolesQuery.data) {
        return {
          success: false,
          repaired: false,
          error: 'Cannot repair: failed to fetch users with admin roles'
        };
      }
      
      const userIds = userRolesQuery.data.map(ur => ur.user_id);
      
      const { data: adminUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, display_name, email')
        .in('id', userIds);
      
      if (usersError || !adminUsers || adminUsers.length === 0) {
        return {
          success: false,
          repaired: false,
          error: 'Cannot repair: no admin users found to assign as step approvers'
        };
      }
      
      // Create a default step with the first admin as approver
      const { data: newStep, error: stepError } = await supabase
        .from('workflow_steps')
        .insert({
          workflow_id: workflowId,
          step_order: 1,
          step_name: 'الموافقة على الطلب',
          step_type: 'decision',
          approver_id: adminUsers[0].id,
          approver_type: 'user',
          instructions: 'الرجاء مراجعة الطلب والموافقة عليه أو رفضه',
          is_required: true
        })
        .select()
        .single();
      
      if (stepError) {
        return {
          success: false,
          repaired: false,
          error: `Failed to create default step: ${stepError.message}`
        };
      }
      
      // Log the repair operation
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'repair_workflow',
          p_workflow_id: workflowId,
          p_step_id: newStep.id,
          p_details: 'Created default step for workflow with no steps'
        });
      } catch (logError) {
        console.error('Failed to log repair operation:', logError);
      }
      
      // Update all requests using this workflow to use the new step
      const { data: updatedRequests, error: updateError } = await supabase
        .from('requests')
        .update({ current_step_id: newStep.id })
        .eq('workflow_id', workflowId)
        .is('current_step_id', null)
        .select('id');
      
      return {
        success: true,
        repaired: true,
        message: 'Created default step for workflow and updated related requests',
        workflow: validation.workflow,
        newStep,
        updatedRequestsCount: updatedRequests?.length || 0
      };
    }
    
    // If there are steps but they have issues, repair them
    const stepsWithIssues = validation.steps.filter(step => !step.approver_id);
    if (stepsWithIssues.length > 0) {
      // Get an admin user to use as approver
      const { data: adminUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .in('id', (
          await supabase
            .from('user_roles')
            .select('user_id')
            .in('role_id', (
              await supabase
                .from('roles')
                .select('id')
                .eq('name', 'admin')
            ).data?.[0]?.id || ''
        ).data?.[0]?.user_id || '')
        .single();
      
      if (userError || !adminUser) {
        return {
          success: false,
          repaired: false,
          error: 'Cannot repair: no admin user found to assign as step approver'
        };
      }
      
      const repairedSteps = [];
      
      // Update steps with missing approvers
      for (const step of stepsWithIssues) {
        const { data: updatedStep, error: updateError } = await supabase
          .from('workflow_steps')
          .update({ approver_id: adminUser.id })
          .eq('id', step.id)
          .select()
          .single();
        
        if (!updateError) {
          repairedSteps.push(updatedStep);
        }
      }
      
      return {
        success: true,
        repaired: true,
        message: `Repaired ${repairedSteps.length} steps with missing approvers`,
        workflow: validation.workflow,
        repairedSteps
      };
    }
    
    // For other issues, return the validation result but indicate repair not attempted
    return {
      success: false,
      repaired: false,
      error: 'Cannot automatically repair the identified issues',
      issues: validation.issues,
      workflow: validation.workflow,
      steps: validation.steps
    };
  } catch (error) {
    console.error('Exception in repairWorkflow:', error);
    return { 
      success: false, 
      repaired: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

