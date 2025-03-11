
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

export const useRequestActions = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: { requestId: string, stepId: string, comments?: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        console.log("Approving request:", { requestId, stepId, comments });
        
        const { data: approvalData, error: approvalFindError } = await supabase
          .from("request_approvals")
          .select("id")
          .eq("request_id", requestId)
          .eq("step_id", stepId)
          .eq("approver_id", user.id)
          .eq("status", "pending")
          .single();
          
        if (approvalFindError) {
          console.error("Error finding approval record:", approvalFindError);
          throw new Error(`Approval record not found: ${approvalFindError.message}`);
        }
        
        const approvalId = approvalData.id;
        
        const { error: approvalUpdateError } = await supabase
          .from("request_approvals")
          .update({
            status: "approved",
            comments: comments,
            approved_at: new Date().toISOString()
          })
          .eq("id", approvalId);
        
        if (approvalUpdateError) {
          console.error("Error updating approval:", approvalUpdateError);
          throw new Error(`Failed to update approval record: ${approvalUpdateError.message}`);
        }
        
        const { data: request, error: requestError } = await supabase
          .from("requests")
          .select(`
            workflow_id,
            current_step_id
          `)
          .eq("id", requestId)
          .single();
            
        if (requestError) {
          console.error("Error fetching request:", requestError);
          throw new Error(`Failed to fetch request: ${requestError.message}`);
        }
        
        const { data: currentStepData, error: currentStepError } = await supabase
          .from("request_workflow_steps")
          .select("step_order")
          .eq("id", stepId)
          .single();
          
        if (currentStepError) {
          console.error("Error fetching current step order:", currentStepError);
          throw new Error(`Failed to fetch current step: ${currentStepError.message}`);
        }
          
        const { data: nextStep, error: nextStepError } = await supabase
          .from("request_workflow_steps")
          .select("id, approver_id, approver_type")
          .eq("workflow_id", request.workflow_id)
          .gt("step_order", currentStepData.step_order)
          .order("step_order", { ascending: true })
          .limit(1)
          .maybeSingle();
        
        const updateData: any = {};
        
        if (!nextStep) {
          updateData.status = "approved";
          console.log("Request approved (final step)");
        } else {
          updateData.current_step_id = nextStep.id;
          updateData.status = "in_progress";
          console.log("Moving to next step:", nextStep.id);
          
          // Handle different approver types
          if (nextStep.approver_type === 'role') {
            console.log("Creating role-based approvals for role:", nextStep.approver_id);
            
            const { data: usersWithRole, error: roleError } = await supabase
              .from("user_roles")
              .select("user_id")
              .eq("role_id", nextStep.approver_id);
              
            if (roleError) {
              console.error("Error fetching users with role:", roleError);
            } else if (usersWithRole && usersWithRole.length > 0) {
              for (const userRole of usersWithRole) {
                const { error: approvalError } = await supabase
                  .from("request_approvals")
                  .insert({
                    request_id: requestId,
                    step_id: nextStep.id,
                    approver_id: userRole.user_id,
                    status: "pending"
                  });
                
                if (approvalError) {
                  console.error("Error creating role-based approval:", approvalError);
                }
              }
            } else {
              console.warn("No users found with role ID:", nextStep.approver_id);
            }
          } else {
            // Direct user approver
            const { error: nextApprovalError } = await supabase
              .from("request_approvals")
              .insert({
                request_id: requestId,
                step_id: nextStep.id,
                approver_id: nextStep.approver_id,
                status: "pending"
              });
            
            if (nextApprovalError) {
              console.error("Error creating next approval:", nextApprovalError);
            }
          }
        }
        
        const { error: updateError } = await supabase
          .from("requests")
          .update(updateData)
          .eq("id", requestId);
        
        if (updateError) {
          console.error("Error updating request:", updateError);
          console.error("Error code:", updateError.code);
          console.error("Error message:", updateError.message);
          throw new Error(`Failed to update request: ${updateError.message}`);
        }
        
        return { requestId, stepId };
      } catch (error) {
        console.error("Error in approveRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request-details"] });
      toast.success("تمت الموافقة على الطلب بنجاح");
    },
    onError: (error: any) => {
      console.error("Error approving request:", error);
      toast.error(error.message || "حدث خطأ أثناء الموافقة على الطلب");
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: { requestId: string, stepId: string, comments: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      if (!comments || comments.trim() === '') {
        throw new Error("يجب إدخال سبب الرفض");
      }
      
      try {
        console.log("Rejecting request:", { requestId, stepId, comments });
        
        const { data: approvalData, error: approvalFindError } = await supabase
          .from("request_approvals")
          .select("id")
          .eq("request_id", requestId)
          .eq("step_id", stepId)
          .eq("approver_id", user.id)
          .eq("status", "pending")
          .single();
          
        if (approvalFindError) {
          console.error("Error finding approval record:", approvalFindError);
          throw new Error(`Approval record not found: ${approvalFindError.message}`);
        }
        
        const approvalId = approvalData.id;
        
        const { error: approvalUpdateError } = await supabase
          .from("request_approvals")
          .update({
            status: "rejected",
            comments: comments,
            approved_at: new Date().toISOString()
          })
          .eq("id", approvalId);
        
        if (approvalUpdateError) {
          console.error("Error updating approval:", approvalUpdateError);
          throw new Error(`Failed to update approval record: ${approvalUpdateError.message}`);
        }
        
        const { error: updateError } = await supabase
          .from("requests")
          .update({ status: "rejected" })
          .eq("id", requestId);
        
        if (updateError) {
          console.error("Error updating request:", updateError);
          console.error("Error code:", updateError.code);
          console.error("Error message:", updateError.message);
          throw new Error(`Failed to update request: ${updateError.message}`);
        }
        
        return { requestId, stepId };
      } catch (error) {
        console.error("Error in rejectRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request-details"] });
      toast.success("تم رفض الطلب بنجاح");
    },
    onError: (error: any) => {
      console.error("Error rejecting request:", error);
      if (error.message === "يجب إدخال سبب الرفض") {
        toast.error(error.message);
      } else {
        toast.error(error.message || "حدث خطأ أثناء رفض الطلب");
      }
    }
  });

  return { approveRequest, rejectRequest };
};
