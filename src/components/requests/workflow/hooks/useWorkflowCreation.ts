
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseWorkflowCreationProps {
  setWorkflowId: (id: string | null) => void;
  setError: (value: string | null) => void;
}

export const useWorkflowCreation = ({
  setWorkflowId,
  setError,
}: UseWorkflowCreationProps) => {

  const ensureWorkflowExists = async (requestTypeId: string | null, currentWorkflowId: string | null): Promise<string> => {
    // Debug log: Starting ensureWorkflowExists
    console.log("ensureWorkflowExists called with:", { requestTypeId, currentWorkflowId });
    
    // Check if we have a valid existing workflow ID
    if (currentWorkflowId && currentWorkflowId !== 'temp-workflow-id') {
      try {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(currentWorkflowId)) {
          console.error("Invalid workflow ID format:", currentWorkflowId);
          
          // Log the invalid format
          try {
            await supabase.rpc('log_workflow_operation', {
              p_operation_type: 'workflow_validation_error',
              p_workflow_id: null,
              p_request_data: { workflow_id: currentWorkflowId },
              p_error_message: 'Invalid workflow ID format',
              p_details: 'Workflow ID does not match UUID format'
            });
          } catch (logError) {
            console.warn("Error logging validation (non-critical):", logError);
          }
          
          throw new Error("Invalid workflow ID format");
        }
        
        // Verify workflow exists in database
        const { data: existingWorkflow, error: workflowCheckError } = await supabase
          .from('request_workflows')
          .select('id, name')
          .eq('id', currentWorkflowId)
          .single();
          
        // Debug log: Workflow check results
        console.log("Workflow check results:", { existingWorkflow, workflowCheckError });
        
        if (workflowCheckError) {
          console.error("Error validating workflow:", workflowCheckError);
          
          // Log the validation error
          try {
            await supabase.rpc('log_workflow_operation', {
              p_operation_type: 'workflow_validation_error',
              p_workflow_id: currentWorkflowId,
              p_request_data: null,
              p_error_message: workflowCheckError.message,
              p_details: 'Error checking if workflow exists'
            });
          } catch (logError) {
            console.warn("Error logging validation error (non-critical):", logError);
          }
          
          if (workflowCheckError.code === 'PGRST116') {
            throw new Error("ليس لديك صلاحية للوصول إلى مسار العمل");
          }
          throw new Error(`خطأ في التحقق من مسار العمل: ${workflowCheckError.message}`);
        }
        
        if (existingWorkflow) {
          console.log("Using existing workflow:", existingWorkflow.name, existingWorkflow.id);
          
          // Log success - existing workflow found
          try {
            await supabase.rpc('log_workflow_operation', {
              p_operation_type: 'existing_workflow_found',
              p_workflow_id: currentWorkflowId,
              p_response_data: { workflow_name: existingWorkflow.name },
              p_details: 'Using existing workflow'
            });
          } catch (logError) {
            console.warn("Error logging existing workflow (non-critical):", logError);
          }
          
          return currentWorkflowId;
        } else {
          console.error("Workflow ID not found in database:", currentWorkflowId);
          
          // Log not found error
          try {
            await supabase.rpc('log_workflow_operation', {
              p_operation_type: 'workflow_not_found',
              p_workflow_id: currentWorkflowId,
              p_error_message: 'Workflow ID not found in database',
              p_details: 'The workflow ID exists but not found in database'
            });
          } catch (logError) {
            console.warn("Error logging workflow not found (non-critical):", logError);
          }
          
          throw new Error("مسار العمل غير موجود في قاعدة البيانات");
        }
      } catch (error) {
        console.error("Error validating workflow ID:", error);
        // Fall through to create a new workflow
      }
    }

    try {
      if (!requestTypeId) {
        console.log("No request type ID, returning temporary workflow ID");
        return 'temp-workflow-id';
      }

      // Validate UUID format for requestTypeId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(requestTypeId)) {
        console.error("Invalid request type ID format:", requestTypeId);
        
        // Log the invalid format
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'request_type_validation_error',
            p_request_type_id: requestTypeId,
            p_request_data: null,
            p_error_message: 'Invalid request type ID format',
            p_details: 'Request type ID does not match UUID format'
          });
        } catch (logError) {
          console.warn("Error logging validation error (non-critical):", logError);
        }
        
        throw new Error("معرف نوع الطلب غير صالح");
      }

      console.log("Creating new workflow for request type:", requestTypeId);
      
      // Log workflow creation attempt
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'workflow_creation_attempt',
          p_request_type_id: requestTypeId,
          p_request_data: null,
          p_details: 'Attempting to create a new workflow'
        });
      } catch (logError) {
        console.warn("Error logging creation attempt (non-critical):", logError);
      }
      
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User is not authenticated");
        
        // Log authentication error
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'auth_error',
            p_request_type_id: requestTypeId,
            p_error_message: 'User is not authenticated',
            p_details: 'No session found when creating workflow'
          });
        } catch (logError) {
          console.warn("Error logging auth error (non-critical):", logError);
        }
        
        throw new Error("يجب تسجيل الدخول لإنشاء مسار العمل");
      }

      // Debug log: Authenticated user
      console.log("Authenticated user:", session.user.id);

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', session.user.id);
        
      // Debug log: User roles check
      console.log("User roles check:", { userRoles, roleError });
      
      if (roleError) {
        console.error("Error checking user roles:", roleError);
        
        // Log role check error
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'role_check_error',
            p_request_type_id: requestTypeId,
            p_error_message: roleError.message,
            p_details: 'Error checking user roles'
          });
        } catch (logError) {
          console.warn("Error logging role check error (non-critical):", logError);
        }
        
        throw new Error("خطأ في التحقق من صلاحيات المستخدم");
      }
      
      const isAdmin = userRoles?.some(role => {
        if (role.roles) {
          const roleName = Array.isArray(role.roles) 
            ? (role.roles[0]?.name) 
            : (role.roles as any).name;
          return roleName === 'admin' || roleName === 'app_admin';
        }
        return false;
      });
      
      // Debug log: Admin status
      console.log("User is admin:", isAdmin);
      
      if (!isAdmin) {
        console.warn("User is not an admin, may not have permission to create workflows");
        
        // Log permission warning
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'permission_warning',
            p_request_type_id: requestTypeId,
            p_details: 'User is not an admin but attempting to create workflow'
          });
        } catch (logError) {
          console.warn("Error logging permission warning (non-critical):", logError);
        }
      }

      // Create new workflow using RPC function
      console.log("Calling upsert_workflow RPC");
      const { data: newWorkflow, error: createError } = await supabase.rpc(
        'upsert_workflow',
        {
          workflow_data: {
            name: 'مسار افتراضي',
            request_type_id: requestTypeId,
            is_active: true
          },
          is_update: false
        }
      );

      // Debug log: Workflow creation response
      console.log("Workflow creation response:", { newWorkflow, createError });

      if (createError) {
        console.error("Error creating workflow:", createError);
        
        // Log workflow creation error
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'workflow_creation_error',
            p_request_type_id: requestTypeId,
            p_error_message: createError.message,
            p_details: `Error code: ${createError.code}, Details: ${createError.details || 'No details'}`
          });
        } catch (logError) {
          console.warn("Error logging creation error (non-critical):", logError);
        }
        
        if (createError.code === 'PGRST116') {
          throw new Error("ليس لديك صلاحية لإنشاء مسار العمل");
        }
        throw createError;
      }

      if (!newWorkflow || !newWorkflow.id) {
        // Log workflow creation failure
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'workflow_creation_error',
            p_request_type_id: requestTypeId,
            p_error_message: 'No workflow ID returned',
            p_details: 'The workflow creation did not return a valid workflow ID'
          });
        } catch (logError) {
          console.warn("Error logging creation failure (non-critical):", logError);
        }
        
        throw new Error("فشل في إنشاء مسار العمل: لم يتم إرجاع معرف");
      }

      const newWorkflowId = newWorkflow.id;
      console.log("Created new workflow with ID:", newWorkflowId);
      
      // Log successful workflow creation
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'workflow_creation_success',
          p_request_type_id: requestTypeId,
          p_workflow_id: newWorkflowId,
          p_response_data: newWorkflow,
          p_details: 'Successfully created new workflow'
        });
      } catch (logError) {
        console.warn("Error logging creation success (non-critical):", logError);
      }
      
      setWorkflowId(newWorkflowId);
      
      return newWorkflowId;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('فشل في إنشاء مسار العمل');
      setError('فشل في إنشاء مسار العمل: ' + error.message);
      throw error;
    }
  };

  const updateDefaultWorkflow = async (requestTypeId: string | null, workflowId: string | null) => {
    if (!requestTypeId || !workflowId || workflowId === 'temp-workflow-id') {
      return;
    }
    
    // Debug log: Starting default workflow update
    console.log("updateDefaultWorkflow called with:", { requestTypeId, workflowId });
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workflowId) || !uuidRegex.test(requestTypeId)) {
      console.error("Invalid UUID format for updating default workflow:", { requestTypeId, workflowId });
      
      // Log the validation error
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'default_workflow_validation_error',
          p_request_type_id: requestTypeId,
          p_workflow_id: workflowId,
          p_error_message: 'Invalid UUID format',
          p_details: 'One or both IDs do not match UUID format'
        });
      } catch (logError) {
        console.warn("Error logging validation error (non-critical):", logError);
      }
      
      return;
    }
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User is not authenticated");
        
        // Log authentication error
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'default_workflow_auth_error',
            p_request_type_id: requestTypeId,
            p_workflow_id: workflowId,
            p_error_message: 'User is not authenticated',
            p_details: 'No session found when updating default workflow'
          });
        } catch (logError) {
          console.warn("Error logging auth error (non-critical):", logError);
        }
        
        return;
      }

      console.log("Setting default workflow for request type:", requestTypeId, workflowId);
      
      // Log default workflow update attempt
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'default_workflow_update_attempt',
          p_request_type_id: requestTypeId,
          p_workflow_id: workflowId,
          p_details: 'Attempting to set default workflow'
        });
      } catch (logError) {
        console.warn("Error logging update attempt (non-critical):", logError);
      }
      
      const { error: updateError } = await supabase.rpc(
        'set_default_workflow',
        {
          p_request_type_id: requestTypeId,
          p_workflow_id: workflowId
        }
      );

      if (updateError) {
        console.warn("Could not set default workflow for request type:", updateError);
        
        // Log update error
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'default_workflow_update_error',
            p_request_type_id: requestTypeId,
            p_workflow_id: workflowId,
            p_error_message: updateError.message,
            p_details: `Error code: ${updateError.code}, Details: ${updateError.details || 'No details'}`
          });
        } catch (logError) {
          console.warn("Error logging update error (non-critical):", logError);
        }
        
        // Non-fatal error, continue
      } else {
        console.log("Successfully set default workflow for request type");
        
        // Log successful update
        try {
          await supabase.rpc('log_workflow_operation', {
            p_operation_type: 'default_workflow_update_success',
            p_request_type_id: requestTypeId,
            p_workflow_id: workflowId,
            p_details: 'Successfully set default workflow'
          });
        } catch (logError) {
          console.warn("Error logging update success (non-critical):", logError);
        }
      }
    } catch (error) {
      console.error("Error updating default workflow:", error);
      
      // Log unexpected error
      try {
        await supabase.rpc('log_workflow_operation', {
          p_operation_type: 'default_workflow_unexpected_error',
          p_request_type_id: requestTypeId,
          p_workflow_id: workflowId,
          p_error_message: error.message,
          p_details: error.stack || 'No stack trace available'
        });
      } catch (logError) {
        console.warn("Error logging unexpected error (non-critical):", logError);
      }
    }
  };

  return {
    ensureWorkflowExists,
    updateDefaultWorkflow
  };
};
