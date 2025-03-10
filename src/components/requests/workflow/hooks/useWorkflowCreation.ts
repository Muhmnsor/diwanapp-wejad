
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
    // Check if we have a valid existing workflow ID
    if (currentWorkflowId && currentWorkflowId !== 'temp-workflow-id') {
      try {
        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(currentWorkflowId)) {
          console.error("Invalid workflow ID format:", currentWorkflowId);
          throw new Error("Invalid workflow ID format");
        }
        
        // Verify workflow exists in database
        const { data: existingWorkflow, error: workflowCheckError } = await supabase
          .from('request_workflows')
          .select('id, name')
          .eq('id', currentWorkflowId)
          .single();
          
        if (workflowCheckError) {
          console.error("Error validating workflow:", workflowCheckError);
          if (workflowCheckError.code === 'PGRST116') {
            throw new Error("ليس لديك صلاحية للوصول إلى مسار العمل");
          }
          throw new Error(`خطأ في التحقق من مسار العمل: ${workflowCheckError.message}`);
        }
        
        if (existingWorkflow) {
          console.log("Using existing workflow:", existingWorkflow.name, existingWorkflow.id);
          return currentWorkflowId;
        } else {
          console.error("Workflow ID not found in database:", currentWorkflowId);
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
        throw new Error("معرف نوع الطلب غير صالح");
      }

      console.log("Creating new workflow for request type:", requestTypeId);
      
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User is not authenticated");
        throw new Error("يجب تسجيل الدخول لإنشاء مسار العمل");
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', session.user.id);
        
      if (roleError) {
        console.error("Error checking user roles:", roleError);
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
      
      if (!isAdmin) {
        console.warn("User is not an admin, may not have permission to create workflows");
      }

      // Create new workflow using RPC function
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

      if (createError) {
        console.error("Error creating workflow:", createError);
        if (createError.code === 'PGRST116') {
          throw new Error("ليس لديك صلاحية لإنشاء مسار العمل");
        }
        throw createError;
      }

      if (!newWorkflow || !newWorkflow.id) {
        throw new Error("فشل في إنشاء مسار العمل: لم يتم إرجاع معرف");
      }

      const newWorkflowId = newWorkflow.id;
      console.log("Created new workflow with ID:", newWorkflowId);
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
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workflowId) || !uuidRegex.test(requestTypeId)) {
      console.error("Invalid UUID format for updating default workflow:", { requestTypeId, workflowId });
      return;
    }
    
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("User is not authenticated");
        return;
      }

      console.log("Setting default workflow for request type:", requestTypeId, workflowId);
      const { error: updateError } = await supabase.rpc(
        'set_default_workflow',
        {
          p_request_type_id: requestTypeId,
          p_workflow_id: workflowId
        }
      );

      if (updateError) {
        console.warn("Could not set default workflow for request type:", updateError);
        // Non-fatal error, continue
      } else {
        console.log("Successfully set default workflow for request type");
      }
    } catch (error) {
      console.error("Error updating default workflow:", error);
    }
  };

  return {
    ensureWorkflowExists,
    updateDefaultWorkflow
  };
};
