
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequestType, Request } from "../types";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export const useRequests = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  // Fetch incoming requests (requests requiring approval by the current user)
  const {
    data: incomingRequests,
    isLoading: incomingLoading,
    refetch: refetchIncomingRequests,
  } = useQuery({
    queryKey: ["incomingRequests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Query for requests that have workflow steps assigned to the current user
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          request_types:request_type_id (name),
          workflow_steps!workflow_steps_id_fkey (*)
        `)
        .eq("workflow_steps.approver_id", user.id)
        .eq("status", "pending");
      
      if (error) {
        console.error("Error fetching incoming requests:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });
  
  // Fetch outgoing requests (requests created by the current user)
  const {
    data: outgoingRequests,
    isLoading: outgoingLoading,
    refetch: refetchOutgoingRequests,
  } = useQuery({
    queryKey: ["outgoingRequests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          request_types:request_type_id (name)
        `)
        .eq("requester_id", user.id);
      
      if (error) {
        console.error("Error fetching outgoing requests:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });
  
  // Fetch request types
  const {
    data: requestTypes,
    isLoading: requestTypesLoading,
  } = useQuery({
    queryKey: ["requestTypes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("request_types")
        .select("*")
        .eq("is_active", true);
      
      if (error) {
        console.error("Error fetching request types:", error);
        throw error;
      }
      
      return data || [];
    },
  });
  
  // Create a new request
  const createRequest = useMutation({
    mutationFn: async (formData: {
      title: string;
      request_type_id: string;
      form_data: Record<string, any>;
      priority?: string;
      due_date?: string;
    }) => {
      if (!user) throw new Error("يجب تسجيل الدخول لإنشاء طلب");
      
      // Get the default workflow for this request type
      const { data: requestType, error: requestTypeError } = await supabase
        .from("request_types")
        .select("default_workflow_id")
        .eq("id", formData.request_type_id)
        .single();
      
      if (requestTypeError) throw requestTypeError;
      
      const workflow_id = requestType.default_workflow_id;
      
      if (!workflow_id) {
        throw new Error("لا يوجد مسار عمل افتراضي لهذا النوع من الطلبات");
      }
      
      // Find the first step in the workflow
      const { data: firstStep, error: stepError } = await supabase
        .from("workflow_steps")
        .select("id")
        .eq("workflow_id", workflow_id)
        .eq("step_order", 1)
        .single();
      
      if (stepError) throw stepError;
      
      // Create the request
      const { data, error } = await supabase
        .from("requests")
        .insert([
          {
            title: formData.title,
            request_type_id: formData.request_type_id,
            form_data: formData.form_data,
            requester_id: user.id,
            workflow_id: workflow_id,
            current_step_id: firstStep.id,
            status: "pending",
            priority: formData.priority || "medium",
            due_date: formData.due_date || null,
          },
        ])
        .select();
      
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: () => {
      toast.success("تم إنشاء الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["outgoingRequests"] });
    },
    onError: (error: any) => {
      console.error("Error creating request:", error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء الطلب");
    },
  });
  
  // Approve a request
  const approveRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments?: string }) => {
      if (!user) throw new Error("يجب تسجيل الدخول لاعتماد الطلب");
      
      // Get the current request details
      const { data: request, error: requestError } = await supabase
        .from("requests")
        .select("current_step_id, workflow_id")
        .eq("id", requestId)
        .single();
      
      if (requestError) throw requestError;
      
      // Create approval record
      const { data: approval, error: approvalError } = await supabase
        .from("request_approvals")
        .insert([
          {
            request_id: requestId,
            step_id: request.current_step_id,
            approver_id: user.id,
            status: "approved",
            comments: comments || null,
            approved_at: new Date().toISOString(),
          },
        ])
        .select();
      
      if (approvalError) throw approvalError;
      
      // Find the next step in the workflow
      const { data: currentStep, error: stepError } = await supabase
        .from("workflow_steps")
        .select("step_order")
        .eq("id", request.current_step_id)
        .single();
      
      if (stepError) throw stepError;
      
      const { data: nextStep, error: nextStepError } = await supabase
        .from("workflow_steps")
        .select("id")
        .eq("workflow_id", request.workflow_id)
        .eq("step_order", currentStep.step_order + 1)
        .single();
      
      // If there's a next step, update the request to point to it
      if (!nextStepError && nextStep) {
        const { error: updateError } = await supabase
          .from("requests")
          .update({
            current_step_id: nextStep.id,
          })
          .eq("id", requestId);
        
        if (updateError) throw updateError;
      } else {
        // If there's no next step, mark the request as complete
        const { error: completeError } = await supabase
          .from("requests")
          .update({
            status: "approved",
            current_step_id: null,
          })
          .eq("id", requestId);
        
        if (completeError) throw completeError;
      }
      
      return approval[0];
    },
    onSuccess: () => {
      toast.success("تم اعتماد الطلب بنجاح");
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
    },
    onError: (error: any) => {
      console.error("Error approving request:", error);
      toast.error(error.message || "حدث خطأ أثناء اعتماد الطلب");
    },
  });
  
  // Reject a request
  const rejectRequest = useMutation({
    mutationFn: async ({ requestId, comments }: { requestId: string; comments: string }) => {
      if (!user) throw new Error("يجب تسجيل الدخول لرفض الطلب");
      
      // Create rejection record
      const { data: rejection, error: rejectionError } = await supabase
        .from("request_approvals")
        .insert([
          {
            request_id: requestId,
            step_id: null, // Current step ID should be set properly
            approver_id: user.id,
            status: "rejected",
            comments: comments,
            approved_at: new Date().toISOString(),
          },
        ])
        .select();
      
      if (rejectionError) throw rejectionError;
      
      // Update the request status
      const { error: updateError } = await supabase
        .from("requests")
        .update({
          status: "rejected",
        })
        .eq("id", requestId);
      
      if (updateError) throw updateError;
      
      return rejection[0];
    },
    onSuccess: () => {
      toast.success("تم رفض الطلب");
      queryClient.invalidateQueries({ queryKey: ["incomingRequests"] });
    },
    onError: (error: any) => {
      console.error("Error rejecting request:", error);
      toast.error(error.message || "حدث خطأ أثناء رفض الطلب");
    },
  });
  
  return {
    incomingRequests,
    outgoingRequests,
    requestTypes,
    incomingLoading,
    outgoingLoading,
    requestTypesLoading,
    refetchIncomingRequests,
    refetchOutgoingRequests,
    createRequest,
    approveRequest,
    rejectRequest,
  };
};
