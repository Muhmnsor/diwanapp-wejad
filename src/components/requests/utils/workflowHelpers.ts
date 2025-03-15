
import { supabase } from "@/integrations/supabase/client";

/**
 * Diagnoses issues with a request's workflow
 * @param requestId The ID of the request to diagnose
 * @returns Diagnosis result with any issues found
 */
export const diagnoseRequestWorkflow = async (requestId: string) => {
  try {
    // Call the diagnostic function
    const { data, error } = await supabase
      .rpc('diagnose_workflow_issues', { 
        p_request_id: requestId 
      });
    
    if (error) {
      console.error("Error diagnosing workflow:", error);
      throw error;
    }
    
    return data || { issues: [] };
  } catch (error) {
    console.error("Error in workflow diagnosis:", error);
    return { 
      success: false, 
      issues: ["حدث خطأ أثناء تشخيص مسار العمل"] 
    };
  }
};

/**
 * Updates a workflow step for a request
 */
export const updateWorkflowStep = async (
  requestId: string, 
  currentStepId: string, 
  action: 'approve' | 'reject' | 'complete',
  metadata?: Record<string, any>
) => {
  try {
    // Use the Edge Function to update the workflow
    const { data, error } = await supabase.functions.invoke('update-workflow-step', {
      body: {
        requestId,
        currentStepId,
        action,
        metadata
      }
    });
    
    if (error) {
      console.error("Error updating workflow step:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in workflow step update:", error);
    throw new Error(error instanceof Error ? error.message : "خطأ غير معروف");
  }
};

/**
 * Validates a new request before submission
 */
export const validateNewRequest = async (requestData: any) => {
  try {
    // Check if workflow is valid
    if (requestData.workflow_id) {
      const { data, error } = await supabase
        .rpc('validate_workflow', { 
          p_workflow_id: requestData.workflow_id 
        });
      
      if (error) throw error;
      
      if (!data.valid) {
        return { 
          valid: false, 
          error: data.message || "مسار العمل غير صالح", 
          requestData 
        };
      }
    }
    
    return { valid: true, requestData };
  } catch (error) {
    console.error("Error validating request:", error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : "خطأ في التحقق من صحة الطلب",
      requestData
    };
  }
};

/**
 * Validates a request workflow configuration
 * @param requestTypeId ID of the request type to validate workflow for
 * @returns Boolean indicating if the workflow is valid
 */
export const validateRequestWorkflow = async (requestTypeId: string): Promise<boolean> => {
  try {
    console.log(`Validating workflow for request type ${requestTypeId}...`);
    
    // Get the workflow ID for this request type
    const { data: requestType, error: requestTypeError } = await supabase
      .from('request_types')
      .select('workflow_id')
      .eq('id', requestTypeId)
      .single();
    
    if (requestTypeError) {
      console.error("Error fetching request type:", requestTypeError);
      return false;
    }
    
    if (!requestType.workflow_id) {
      console.warn("Request type has no workflow configured");
      return false;
    }
    
    // Validate the workflow configuration
    const { data, error } = await supabase
      .rpc('validate_workflow', { 
        p_workflow_id: requestType.workflow_id 
      });
    
    if (error) {
      console.error("Error validating workflow:", error);
      return false;
    }
    
    return data.valid;
  } catch (error) {
    console.error("Error in workflow validation:", error);
    return false;
  }
};

/**
 * Deletes a request type and its associated workflow
 * @param requestTypeId ID of the request type to delete
 */
export const deleteRequestType = async (requestTypeId: string) => {
  try {
    // First get the workflow ID associated with this request type
    const { data: requestType, error: fetchError } = await supabase
      .from('request_types')
      .select('workflow_id')
      .eq('id', requestTypeId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching request type:", fetchError);
      return { success: false, error: fetchError.message };
    }
    
    // Delete the request type
    const { error: deleteError } = await supabase
      .from('request_types')
      .delete()
      .eq('id', requestTypeId);
    
    if (deleteError) {
      console.error("Error deleting request type:", deleteError);
      return { success: false, error: deleteError.message };
    }
    
    // If there was a workflow associated, delete it too
    if (requestType?.workflow_id) {
      // First delete all workflow steps
      const { error: deleteStepsError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', requestType.workflow_id);
      
      if (deleteStepsError) {
        console.error("Error deleting workflow steps:", deleteStepsError);
        // Continue anyway to try to delete the workflow
      }
      
      // Then delete the workflow itself
      const { error: deleteWorkflowError } = await supabase
        .from('workflows')
        .delete()
        .eq('id', requestType.workflow_id);
      
      if (deleteWorkflowError) {
        console.error("Error deleting workflow:", deleteWorkflowError);
        return { 
          success: true, 
          warning: "تم حذف نوع الطلب لكن فشل حذف مسار العمل المرتبط به" 
        };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error in request type deletion:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "خطأ أثناء حذف نوع الطلب" 
    };
  }
};

/**
 * Fixes orphaned request types (those without workflows or with invalid workflows)
 */
export const fixOrphanedRequestTypes = async () => {
  try {
    // Get all request types
    const { data: requestTypes, error: fetchError } = await supabase
      .from('request_types')
      .select('id, name, workflow_id');
    
    if (fetchError) {
      console.error("Error fetching request types:", fetchError);
      return { success: false, error: fetchError.message };
    }
    
    const results = {
      processed: 0,
      fixed: 0,
      errors: 0,
      details: [] as { id: string, name: string, status: string }[]
    };
    
    // Check each request type
    for (const requestType of requestTypes || []) {
      results.processed++;
      
      try {
        // Check if workflow exists
        if (!requestType.workflow_id) {
          // Create a new workflow for this request type
          const { data: newWorkflow, error: createError } = await supabase
            .from('workflows')
            .insert({ name: `Workflow for ${requestType.name}` })
            .select()
            .single();
          
          if (createError) {
            console.error(`Error creating workflow for ${requestType.id}:`, createError);
            results.errors++;
            results.details.push({
              id: requestType.id,
              name: requestType.name,
              status: `Failed to create workflow: ${createError.message}`
            });
            continue;
          }
          
          // Update the request type with the new workflow ID
          const { error: updateError } = await supabase
            .from('request_types')
            .update({ workflow_id: newWorkflow.id })
            .eq('id', requestType.id);
          
          if (updateError) {
            console.error(`Error updating request type ${requestType.id}:`, updateError);
            results.errors++;
            results.details.push({
              id: requestType.id,
              name: requestType.name,
              status: `Failed to update with new workflow: ${updateError.message}`
            });
            continue;
          }
          
          // Create a default approval step
          const { error: stepError } = await supabase
            .from('workflow_steps')
            .insert({
              workflow_id: newWorkflow.id,
              step_type: 'decision',
              step_order: 1,
              name: 'الموافقة',
              approvers_type: 'specific',
              required_approvals: 1
            });
          
          if (stepError) {
            console.error(`Error creating step for ${requestType.id}:`, stepError);
            results.errors++;
            results.details.push({
              id: requestType.id,
              name: requestType.name,
              status: `Created workflow but failed to create step: ${stepError.message}`
            });
            continue;
          }
          
          results.fixed++;
          results.details.push({
            id: requestType.id,
            name: requestType.name,
            status: 'Created new workflow with default approval step'
          });
        } else {
          // Verify the workflow exists
          const { data: workflow, error: workflowError } = await supabase
            .from('workflows')
            .select('id')
            .eq('id', requestType.workflow_id)
            .single();
          
          if (workflowError) {
            console.error(`Workflow ${requestType.workflow_id} not found for ${requestType.id}`);
            
            // Create a new workflow
            const { data: newWorkflow, error: createError } = await supabase
              .from('workflows')
              .insert({ name: `Workflow for ${requestType.name}` })
              .select()
              .single();
            
            if (createError) {
              results.errors++;
              results.details.push({
                id: requestType.id,
                name: requestType.name,
                status: `Failed to create replacement workflow: ${createError.message}`
              });
              continue;
            }
            
            // Update the request type with the new workflow ID
            const { error: updateError } = await supabase
              .from('request_types')
              .update({ workflow_id: newWorkflow.id })
              .eq('id', requestType.id);
            
            if (updateError) {
              results.errors++;
              results.details.push({
                id: requestType.id,
                name: requestType.name,
                status: `Failed to update with replacement workflow: ${updateError.message}`
              });
              continue;
            }
            
            // Create a default approval step
            const { error: stepError } = await supabase
              .from('workflow_steps')
              .insert({
                workflow_id: newWorkflow.id,
                step_type: 'decision',
                step_order: 1,
                name: 'الموافقة',
                approvers_type: 'specific',
                required_approvals: 1
              });
            
            if (stepError) {
              results.errors++;
              results.details.push({
                id: requestType.id,
                name: requestType.name,
                status: `Created replacement workflow but failed to create step: ${stepError.message}`
              });
              continue;
            }
            
            results.fixed++;
            results.details.push({
              id: requestType.id,
              name: requestType.name,
              status: 'Created replacement workflow with default approval step'
            });
          } else {
            // Check if the workflow has steps
            const { count, error: countError } = await supabase
              .from('workflow_steps')
              .select('*', { count: 'exact', head: true })
              .eq('workflow_id', requestType.workflow_id);
            
            if (countError) {
              results.errors++;
              results.details.push({
                id: requestType.id,
                name: requestType.name,
                status: `Error checking workflow steps: ${countError.message}`
              });
              continue;
            }
            
            if (count === 0) {
              // Create a default approval step
              const { error: stepError } = await supabase
                .from('workflow_steps')
                .insert({
                  workflow_id: requestType.workflow_id,
                  step_type: 'decision',
                  step_order: 1,
                  name: 'الموافقة',
                  approvers_type: 'specific',
                  required_approvals: 1
                });
              
              if (stepError) {
                results.errors++;
                results.details.push({
                  id: requestType.id,
                  name: requestType.name,
                  status: `Failed to create default step: ${stepError.message}`
                });
                continue;
              }
              
              results.fixed++;
              results.details.push({
                id: requestType.id,
                name: requestType.name,
                status: 'Added default approval step to empty workflow'
              });
            } else {
              results.details.push({
                id: requestType.id,
                name: requestType.name,
                status: 'Workflow configuration is valid'
              });
            }
          }
        }
      } catch (e) {
        const error = e as Error;
        results.errors++;
        results.details.push({
          id: requestType.id,
          name: requestType.name,
          status: `Error processing: ${error.message}`
        });
      }
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error("Error fixing orphaned request types:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "خطأ أثناء إصلاح أنواع الطلبات"
    };
  }
};
