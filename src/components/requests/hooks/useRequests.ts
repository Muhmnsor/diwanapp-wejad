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
    
    const { data: approverSteps, error: approverError } = await supabase
      .from("workflow_steps")
      .select("id")
      .eq("approver_id", user.id);
    
    if (approverError) throw approverError;
    
    if (!approverSteps || approverSteps.length === 0) {
      return [];
    }
    
    const stepIds = approverSteps.map(step => step.id);
    
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        request_type:request_types(name)
      `)
      .in("current_step_id", stepIds)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  };

  const fetchOutgoingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        request_type:request_types(name)
      `)
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
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
      
      const { data: requestType, error: typeError } = await supabase
        .from("request_types")
        .select("default_workflow_id")
        .eq("id", requestData.request_type_id)
        .single();
      
      if (typeError) throw typeError;
      
      const workflowId = requestType.default_workflow_id;
      
      let currentStepId = null;
      
      if (workflowId) {
        const { data: firstStep, error: stepError } = await supabase
          .from("workflow_steps")
          .select("id")
          .eq("workflow_id", workflowId)
          .eq("step_order", 1)
          .single();
        
        if (stepError && !stepError.message.includes("No rows found")) {
          throw stepError;
        }
        
        if (firstStep) {
          currentStepId = firstStep.id;
        }
      }
      
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
      
      if (currentStepId) {
        const { data: step, error: fetchStepError } = await supabase
          .from("workflow_steps")
          .select("approver_id")
          .eq("id", currentStepId)
          .single();
        
        if (fetchStepError) throw fetchStepError;
        
        const { error: approvalError } = await supabase
          .from("request_approvals")
          .insert({
            request_id: data[0].id,
            step_id: currentStepId,
            approver_id: step.approver_id,
            status: "pending"
          });
        
        if (approvalError) throw approvalError;
      }
      
      return data[0];
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
      
      if (approvalError) throw approvalError;
      
      const { data: request, error: requestError } = await supabase
        .from("requests")
        .select(`
          workflow_id,
          current_step_id
        `)
        .eq("id", requestId)
        .single();
        
      if (requestError) throw requestError;
      
      const { data: nextStep, error: nextStepError } = await supabase
        .from("workflow_steps")
        .select("id")
        .eq("workflow_id", request.workflow_id)
        .gt("step_order", 
          supabase
            .from("workflow_steps")
            .select("step_order")
            .eq("id", stepId)
            .single()
        )
        .order("step_order", { ascending: true })
        .limit(1)
        .single();
      
      const updateData: any = {};
      
      if (nextStepError && nextStepError.message.includes("No rows found")) {
        updateData.status = "approved";
      } else if (!nextStepError) {
        updateData.current_step_id = nextStep.id;
        updateData.status = "in_progress";
        
        const { data: step, error: fetchStepError } = await supabase
          .from("workflow_steps")
          .select("approver_id")
          .eq("id", nextStep.id)
          .single();
        
        if (fetchStepError) throw fetchStepError;
        
        const { error: nextApprovalError } = await supabase
          .from("request_approvals")
          .insert({
            request_id: requestId,
            step_id: nextStep.id,
            approver_id: step.approver_id,
            status: "pending"
          });
        
        if (nextApprovalError) throw nextApprovalError;
      }
      
      const { error: updateError } = await supabase
        .from("requests")
        .update(updateData)
        .eq("id", requestId);
      
      if (updateError) throw updateError;
      
      return approvalData?.[0];
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
      
      if (rejectionError) throw rejectionError;
      
      const { error: updateError } = await supabase
        .from("requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
      
      if (updateError) throw updateError;
      
      return rejectionData?.[0];
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
