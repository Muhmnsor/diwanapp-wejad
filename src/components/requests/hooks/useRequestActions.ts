
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/refactored-auth";

export const useRequestActions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Helper function to get the next step ID in a workflow
  const getNextStepId = async (workflowId: string, currentStepOrder: number) => {
    if (!workflowId) return null;
    
    const { data, error } = await supabase
      .from("request_workflow_steps")
      .select("id, step_order")
      .eq("workflow_id", workflowId)
      .gt("step_order", currentStepOrder)
      .order("step_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching next step:", error);
      return null;
    }
    
    return data?.id || null;
  };

  // Approve a request
  const approveRequest = useMutation({
    mutationFn: async ({ 
      requestId, 
      stepId, 
      comments 
    }: { 
      requestId: string; 
      stepId: string; 
      comments?: string 
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        console.log(`Approving request ${requestId} at step ${stepId}`);
        
        // 1. Get information about the current step and workflow
        const { data: stepData, error: stepError } = await supabase
          .from("request_workflow_steps")
          .select("workflow_id, step_order, step_type, approver_id")
          .eq("id", stepId)
          .single();
        
        if (stepError) {
          throw new Error(`Error fetching step data: ${stepError.message}`);
        }
        
        console.log("Step data:", stepData);
        
        // 2. Create approval record
        const { data: approvalData, error: approvalError } = await supabase
          .from("request_approvals")
          .insert({
            request_id: requestId,
            step_id: stepId,
            approver_id: user.id,
            status: "approved",
            comments,
            approved_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (approvalError) {
          throw new Error(`Error creating approval: ${approvalError.message}`);
        }
        
        console.log("Created approval record:", approvalData);
        
        // 3. Determine the next step
        const nextStepId = await getNextStepId(stepData.workflow_id, stepData.step_order);
        console.log("Next step ID:", nextStepId);
        
        // 4. Update the request status
        let newStatus = nextStepId ? "in_progress" : "approved";
        
        const { data: updatedRequest, error: updateError } = await supabase
          .from("requests")
          .update({
            current_step_id: nextStepId,
            status: newStatus
          })
          .eq("id", requestId)
          .select()
          .single();
        
        if (updateError) {
          throw new Error(`Error updating request: ${updateError.message}`);
        }
        
        console.log("Updated request:", updatedRequest);
        
        return { approvalData, updatedRequest };
      } catch (error) {
        console.error("Error in approveRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("تمت الموافقة على الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (error) => {
      toast.error(`فشل في الموافقة على الطلب: ${error.message}`);
    }
  });

  // Reject a request
  const rejectRequest = useMutation({
    mutationFn: async ({ 
      requestId, 
      stepId, 
      comments 
    }: { 
      requestId: string; 
      stepId: string; 
      comments: string 
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        console.log(`Rejecting request ${requestId} at step ${stepId}`);
        
        // 1. Create rejection record
        const { data: approvalData, error: approvalError } = await supabase
          .from("request_approvals")
          .insert({
            request_id: requestId,
            step_id: stepId,
            approver_id: user.id,
            status: "rejected",
            comments,
            approved_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (approvalError) {
          throw new Error(`Error creating rejection: ${approvalError.message}`);
        }
        
        console.log("Created rejection record:", approvalData);
        
        // 2. Update the request status
        const { data: updatedRequest, error: updateError } = await supabase
          .from("requests")
          .update({ 
            status: "rejected" 
          })
          .eq("id", requestId)
          .select()
          .single();
        
        if (updateError) {
          throw new Error(`Error updating request: ${updateError.message}`);
        }
        
        console.log("Updated request:", updatedRequest);
        
        return { approvalData, updatedRequest };
      } catch (error) {
        console.error("Error in rejectRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("تم رفض الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (error) => {
      toast.error(`فشل في رفض الطلب: ${error.message}`);
    }
  });

  return { approveRequest, rejectRequest };
};
