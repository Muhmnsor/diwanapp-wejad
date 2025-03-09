
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestType } from "../types";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export const useRequests = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const fetchIncomingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Fetch workflow steps where user is approver
      const { data: approverSteps, error: approverError } = await supabase
        .from("workflow_steps")
        .select("id")
        .eq("approver_id", user.id);
      
      if (approverError) {
        console.error("Error fetching approver steps:", approverError);
        return [];
      }
      
      if (!approverSteps || approverSteps.length === 0) {
        return [];
      }
      
      const stepIds = approverSteps.map(step => step.id);
      
      // Fetch requests for those steps
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          request_type:request_types(name)
        `)
        .in("current_step_id", stepIds)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching incoming requests:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in fetchIncomingRequests:", error);
      return [];
    }
  };

  const fetchOutgoingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          request_type:request_types(name)
        `)
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching outgoing requests:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in fetchOutgoingRequests:", error);
      return [];
    }
  };

  const { data: incomingRequests, isLoading: incomingLoading } = useQuery({
    queryKey: ["requests", "incoming"],
    queryFn: fetchIncomingRequests,
    enabled: !!user
  });

  const { data: outgoingRequests, isLoading: outgoingLoading } = useQuery({
    queryKey: ["requests", "outgoing"],
    queryFn: fetchOutgoingRequests,
    enabled: !!user
  });

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
        // Get request type info
        const { data: requestType, error: typeError } = await supabase
          .from("request_types")
          .select("default_workflow_id")
          .eq("id", requestData.request_type_id)
          .single();
        
        if (typeError) {
          console.error("Error fetching request type:", typeError);
          throw typeError;
        }
        
        const workflowId = requestType.default_workflow_id;
        
        let currentStepId = null;
        
        if (workflowId) {
          // Get first step of workflow
          const { data: firstStep, error: stepError } = await supabase
            .from("workflow_steps")
            .select("id")
            .eq("workflow_id", workflowId)
            .eq("step_order", 1)
            .single();
          
          if (stepError && !stepError.message.includes("No rows found")) {
            console.error("Error fetching first step:", stepError);
            throw stepError;
          }
          
          if (firstStep) {
            currentStepId = firstStep.id;
          }
        }
        
        console.log("Creating request with data:", {
          requester_id: user.id,
          workflow_id: workflowId,
          current_step_id: currentStepId,
          ...requestData
        });
        
        // Create request
        const { data, error } = await supabase
          .from("requests")
          .insert({
            requester_id: user.id,
            workflow_id: workflowId,
            current_step_id: currentStepId,
            ...requestData
          })
          .select();

        if (error) {
          console.error("Error creating request:", error);
          throw error;
        }
        
        console.log("Request created:", data[0]);
        
        // If there's a current step, create approval record
        if (currentStepId) {
          const { data: step, error: fetchStepError } = await supabase
            .from("workflow_steps")
            .select("approver_id")
            .eq("id", currentStepId)
            .single();
          
          if (fetchStepError) {
            console.error("Error fetching step info:", fetchStepError);
            throw fetchStepError;
          }
          
          const { error: approvalError } = await supabase
            .from("request_approvals")
            .insert({
              request_id: data[0].id,
              step_id: currentStepId,
              approver_id: step.approver_id,
              status: "pending"
            });
          
          if (approvalError) {
            console.error("Error creating approval:", approvalError);
            throw approvalError;
          }
        }
        
        return data[0];
      } catch (error) {
        console.error("Error in createRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("تم إنشاء الطلب بنجاح");
    },
    onError: (error) => {
      console.error("Error creating request:", error);
      toast.error("حدث خطأ أثناء إنشاء الطلب");
    }
  });

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: { requestId: string, stepId: string, comments?: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        // Create approval record
        const { data: approvalData, error: approvalError } = await supabase
          .from("request_approvals")
          .insert({
            request_id: requestId,
            step_id: stepId,
            approver_id: user.id,
            status: "approved",
            comments: comments,
            approved_at: new Date().toISOString()
          })
          .select();
        
        if (approvalError) {
          console.error("Error creating approval:", approvalError);
          throw approvalError;
        }
        
        // Get request info
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
          throw requestError;
        }
        
        // Try to find next step
        const { data: currentStepData, error: currentStepError } = await supabase
          .from("workflow_steps")
          .select("step_order")
          .eq("id", stepId)
          .single();
          
        if (currentStepError) {
          console.error("Error fetching current step order:", currentStepError);
          throw currentStepError;
        }
          
        const { data: nextStep, error: nextStepError } = await supabase
          .from("workflow_steps")
          .select("id, approver_id")
          .eq("workflow_id", request.workflow_id)
          .gt("step_order", currentStepData.step_order)
          .order("step_order", { ascending: true })
          .limit(1)
          .single();
        
        // Update request based on whether there's a next step
        const updateData: any = {};
        
        if (nextStepError && nextStepError.message.includes("No rows found")) {
          // No next step, request is completed
          updateData.status = "approved";
          console.log("Request approved (final step)");
        } else if (!nextStepError) {
          // Move to next step
          updateData.current_step_id = nextStep.id;
          updateData.status = "in_progress";
          console.log("Moving to next step:", nextStep.id);
          
          // Create approval record for next step
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
            throw nextApprovalError;
          }
        }
        
        // Update request
        const { error: updateError } = await supabase
          .from("requests")
          .update(updateData)
          .eq("id", requestId);
        
        if (updateError) {
          console.error("Error updating request:", updateError);
          throw updateError;
        }
        
        return approvalData?.[0];
      } catch (error) {
        console.error("Error in approveRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request"] });
      toast.success("تمت الموافقة على الطلب بنجاح");
    },
    onError: (error) => {
      console.error("Error approving request:", error);
      toast.error("حدث خطأ أثناء الموافقة على الطلب");
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: { requestId: string, stepId: string, comments: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      if (!comments || comments.trim() === '') {
        throw new Error("يجب إدخال سبب الرفض");
      }
      
      try {
        // Create rejection record
        const { data: rejectionData, error: rejectionError } = await supabase
          .from("request_approvals")
          .insert({
            request_id: requestId,
            step_id: stepId,
            approver_id: user.id,
            status: "rejected",
            comments: comments,
            approved_at: new Date().toISOString()
          })
          .select();
        
        if (rejectionError) {
          console.error("Error creating rejection:", rejectionError);
          throw rejectionError;
        }
        
        // Update request status
        const { error: updateError } = await supabase
          .from("requests")
          .update({ status: "rejected" })
          .eq("id", requestId);
        
        if (updateError) {
          console.error("Error updating request:", updateError);
          throw updateError;
        }
        
        return rejectionData?.[0];
      } catch (error) {
        console.error("Error in rejectRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["request"] });
      toast.success("تم رفض الطلب بنجاح");
    },
    onError: (error: any) => {
      console.error("Error rejecting request:", error);
      if (error.message === "يجب إدخال سبب الرفض") {
        toast.error(error.message);
      } else {
        toast.error("حدث خطأ أثناء رفض الطلب");
      }
    }
  });

  return {
    incomingRequests,
    outgoingRequests,
    incomingLoading,
    outgoingLoading,
    createRequest,
    approveRequest,
    rejectRequest
  };
};
