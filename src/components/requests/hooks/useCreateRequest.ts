
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";
import { validateFormData } from "../utils/formValidation";

export const useCreateRequest = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const createApprovalRecord = async (requestId: string, stepId: string) => {
    try {
      const { data: step, error: fetchStepError } = await supabase
        .from("request_workflow_steps")
        .select("approver_id, approver_type")
        .eq("id", stepId)
        .single();
      
      if (fetchStepError) {
        console.error("Error fetching step info:", fetchStepError);
        return;
      }
      
      if (step && step.approver_id) {
        if (step.approver_type === 'role') {
          console.log("Creating approval records for role-based approver:", step.approver_id);
          
          const { data: usersWithRole, error: roleError } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role_id", step.approver_id);
            
          if (roleError) {
            console.error("Error fetching users with role:", roleError);
            return;
          }
          
          for (const userRole of usersWithRole || []) {
            const { error: approvalError } = await supabase
              .from("request_approvals")
              .insert({
                request_id: requestId,
                step_id: stepId,
                approver_id: userRole.user_id,
                status: "pending"
              });
            
            if (approvalError) {
              console.error("Error creating role-based approval:", approvalError);
            }
          }
        } else {
          const { error: approvalError } = await supabase
            .from("request_approvals")
            .insert({
              request_id: requestId,
              step_id: stepId,
              approver_id: step.approver_id,
              status: "pending"
            });
          
          if (approvalError) {
            console.error("Error creating approval:", approvalError);
          }
        }
      }
    } catch (error) {
      console.error("Error creating approval record:", error);
    }
  };

  const createRequest = useMutation({
    mutationFn: async (requestData: {
      request_type_id: string;
      title: string;
      form_data: Record<string, any>;
      priority?: string;
      due_date?: string;
      status?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        console.log("=== بدء إنشاء طلب جديد ===");
        console.log("Creating request with provided data:", requestData);
        
        const { data: requestType, error: typeError } = await supabase
          .from("request_types")
          .select("default_workflow_id, form_schema")
          .eq("id", requestData.request_type_id)
          .single();
        
        if (typeError) {
          console.error("Error fetching request type:", typeError);
          throw new Error(`Failed to fetch request type: ${typeError.message}`);
        }
        
        if (!requestType) {
          throw new Error("Request type not found");
        }
        
        const formSchema = requestType.form_schema;
        const validationResult = validateFormData(requestData.form_data, formSchema);
        
        if (!validationResult.valid) {
          console.error("Form data validation failed:", validationResult.errors);
          throw new Error(`Form validation failed: ${validationResult.errors.join(", ")}`);
        }
        
        const workflowId = requestType.default_workflow_id;
        let currentStepId = null;
        
        if (workflowId) {
          try {
            // Get the first step in the workflow
            const { data: firstStep, error: stepError } = await supabase
              .from("request_workflow_steps")
              .select("id, approver_id, approver_type")
              .eq("workflow_id", workflowId)
              .order("step_order", { ascending: true })
              .limit(1)
              .single();
            
            if (stepError) {
              console.error("Error fetching first step:", stepError);
              console.log("Will continue without a workflow step");
            }
            
            if (firstStep) {
              currentStepId = firstStep.id;
              console.log("Found first workflow step:", currentStepId);
            } else {
              console.log("No workflow steps found for this workflow");
            }
          } catch (stepErr) {
            console.error("Error in workflow step retrieval:", stepErr);
          }
        }
        
        // Ensure the request status is set to 'pending'
        const requestPayload = {
          requester_id: user.id,
          workflow_id: workflowId,
          current_step_id: currentStepId, // Set the current step to the first step of workflow
          title: requestData.title,
          form_data: requestData.form_data,
          request_type_id: requestData.request_type_id,
          priority: requestData.priority || 'medium',
          status: 'pending', // Always create with pending status
          due_date: requestData.due_date || null
        };
        
        console.log("Creating request with processed payload:", requestPayload);
        
        // Insert the request directly
        const { data: insertResult, error: insertError } = await supabase
          .from("requests")
          .insert(requestPayload)
          .select()
          .single();
        
        if (insertError) {
          console.error("Error creating request:", insertError);
          throw new Error(`فشل إنشاء الطلب: ${insertError.message}`);
        }
        
        if (!insertResult) {
          throw new Error("فشل إنشاء الطلب: لم يتم استلام بيانات الإنشاء");
        }
        
        console.log("Request created successfully:", insertResult);
        
        // If we found a current step ID, create the approval record for it
        if (currentStepId) {
          await createApprovalRecord(insertResult.id, currentStepId);
          console.log("Created approval record for step:", currentStepId);
        } else {
          console.log("No current step found, skipping approval record creation");
        }
        
        console.log("=== تم إنشاء الطلب بنجاح ===");
        return insertResult;
      } catch (error) {
        console.error("Error in createRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("تم إنشاء الطلب بنجاح");
    },
    onError: (error: any) => {
      console.error("Error creating request:", error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء الطلب");
    }
  });

  return { createRequest };
};
