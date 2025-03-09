
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
    
    // Get requests where the user is an approver
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
        // Get the first step in the workflow
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
      
      // Create the request
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
      
      // If there's a current step, create an approval record
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

  return {
    incomingRequests,
    outgoingRequests,
    incomingLoading,
    outgoingLoading,
    createRequest
  };
};
