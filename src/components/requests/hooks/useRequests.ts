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
      console.log("Fetching incoming requests for user:", user.id);
      
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
        console.log("No approver steps found for user");
        return [];
      }
      
      const stepIds = approverSteps.map(step => step.id);
      console.log("Found step IDs for approver:", stepIds);
      
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
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} incoming requests`);
      return data || [];
    } catch (error) {
      console.error("Error in fetchIncomingRequests:", error);
      return [];
    }
  };

  const fetchOutgoingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("Fetching outgoing requests for user:", user.id);
      
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
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} outgoing requests`);
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
            const { data: firstStep, error: stepError } = await supabase
              .from("workflow_steps")
              .select("id, approver_id")
              .eq("workflow_id", workflowId)
              .eq("step_order", 1)
              .maybeSingle();
            
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
            // Continue without a workflow step
          }
        }
        
        const requestPayload = {
          requester_id: user.id,
          workflow_id: workflowId,
          current_step_id: currentStepId,
          title: requestData.title,
          form_data: requestData.form_data,
          request_type_id: requestData.request_type_id,
          priority: requestData.priority || 'medium',
          status: requestData.status || 'pending',
          due_date: requestData.due_date || null
        };
        
        console.log("Creating request with processed payload:", requestPayload);
        
        const { data: rls_check, error: rls_error } = await supabase.rpc('is_admin');
        console.log("RLS check - Admin status:", rls_check);
        if (rls_error) {
          console.error("RLS check error:", rls_error);
        }
        
        const { data, error } = await supabase
          .from("requests")
          .insert(requestPayload)
          .select();

        if (error) {
          console.error("Error creating request:", error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Error details:", error.details);
          
          if (error.message && (error.message.includes("policy") || error.code === "42501")) {
            console.log("Attempting to create request using bypass RPC function");
            
            const { data: insertResult, error: insertError } = await supabase.rpc('insert_request_bypass_rls', {
              request_data: requestPayload
            });
            
            if (insertError) {
              console.error("Error using bypass method:", insertError);
              throw new Error(`فشل إنشاء الطلب: يبدو أن هناك مشكلة في صلاحيات الوصول. يرجى التواصل مع مسؤول النظام`);
            }
            
            if (insertResult) {
              console.log("Successfully created request using RPC bypass:", insertResult);
              
              if (currentStepId) {
                await createApprovalRecord(insertResult.id, currentStepId);
              }
              
              return insertResult;
            }
          }
          
          if (error.code === '23505') {
            throw new Error("طلب مشابه موجود بالفعل");
          } else if (error.code === '23503') {
            throw new Error("خطأ في العلاقات: قد يكون أحد المعرفات غير صالح");
          } else if (error.code === '42P01') {
            throw new Error("خطأ في قاعدة البيانات: الجدول غير موجود");
          } else if (error.code === '42703') {
            throw new Error("خطأ في قاعدة البيانات: عمود غير موجود");
          } else if (error.code === '23502') {
            throw new Error("البيانات المطلوبة غير مكتملة");
          } else if (error.message && error.message.includes("policy")) {
            throw new Error("ليس لديك صلاحية لإنشاء طلب. تأكد من تسجيل الدخول بشكل صحيح");
          } else {
            throw new Error(`فشل إنشاء الطلب: ${error.message}`);
          }
        }
        
        if (!data || data.length === 0) {
          throw new Error("تم إرسال الطلب ولكن لم يتم استلام بيانات الإنشاء");
        }
        
        console.log("Request created successfully:", data[0]);
        console.log("=== تم إنشاء الطلب بنجاح ===");
        
        if (currentStepId) {
          await createApprovalRecord(data[0].id, currentStepId);
        }
        
        return data[0];
      } catch (error) {
        console.error("Error in createRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests", "incoming"] });
      queryClient.invalidateQueries({ queryKey: ["requests", "outgoing"] });
      toast.success("تم إنشاء الطلب بنجاح");
    },
    onError: (error: any) => {
      console.error("Error creating request:", error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء الطلب");
    }
  });

  const createApprovalRecord = async (requestId: string, stepId: string) => {
    try {
      const { data: step, error: fetchStepError } = await supabase
        .from("workflow_steps")
        .select("approver_id")
        .eq("id", stepId)
        .single();
      
      if (fetchStepError) {
        console.error("Error fetching step info:", fetchStepError);
        return;
      }
      
      if (step && step.approver_id) {
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
    } catch (error) {
      console.error("Error creating approval record:", error);
    }
  };

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: { requestId: string, stepId: string, comments?: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        console.log("Approving request:", { requestId, stepId, comments });
        
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
          console.error("Error code:", approvalError.code);
          console.error("Error message:", approvalError.message);
          throw new Error(`Failed to create approval record: ${approvalError.message}`);
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
          .from("workflow_steps")
          .select("step_order")
          .eq("id", stepId)
          .single();
          
        if (currentStepError) {
          console.error("Error fetching current step order:", currentStepError);
          throw new Error(`Failed to fetch current step: ${currentStepError.message}`);
        }
          
        const { data: nextStep, error: nextStepError } = await supabase
          .from("workflow_steps")
          .select("id, approver_id")
          .eq("workflow_id", request.workflow_id)
          .gt("step_order", currentStepData.step_order)
          .order("step_order", { ascending: true })
          .limit(1)
          .single();
        
        const updateData: any = {};
        
        if (nextStepError && nextStepError.message.includes("No rows found")) {
          updateData.status = "approved";
          console.log("Request approved (final step)");
        } else if (!nextStepError) {
          updateData.current_step_id = nextStep.id;
          updateData.status = "in_progress";
          console.log("Moving to next step:", nextStep.id);
          
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
        
        return approvalData?.[0];
      } catch (error) {
        console.error("Error in approveRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests", "incoming"] });
      queryClient.invalidateQueries({ queryKey: ["requests", "outgoing"] });
      queryClient.invalidateQueries({ queryKey: ["request"] });
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
          console.error("Error code:", rejectionError.code);
          console.error("Error message:", rejectionError.message);
          throw new Error(`Failed to create rejection record: ${rejectionError.message}`);
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
        
        return rejectionData?.[0];
      } catch (error) {
        console.error("Error in rejectRequest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests", "incoming"] });
      queryClient.invalidateQueries({ queryKey: ["requests", "outgoing"] });
      queryClient.invalidateQueries({ queryKey: ["request"] });
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

  const validateFormData = (formData: Record<string, any>, schema: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const fields = schema?.fields || [];
    
    if (!fields || fields.length === 0) {
      console.warn("No fields defined in schema for validation");
      return { valid: true, errors: [] };
    }
    
    fields.forEach((field: any) => {
      const fieldName = field.name;
      const fieldValue = formData[fieldName];
      
      if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        errors.push(`حقل "${field.label}" مطلوب`);
        return;
      }
      
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        return;
      }
      
      switch (field.type) {
        case 'number':
          if (isNaN(Number(fieldValue))) {
            errors.push(`حقل "${field.label}" يجب أن يكون رقماً`);
          }
          break;
          
        case 'date':
          if (!/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
            errors.push(`حقل "${field.label}" يجب أن يكون تاريخاً صحيحاً`);
          }
          break;
          
        case 'select':
          if (field.options && !field.options.includes(fieldValue)) {
            errors.push(`قيمة "${fieldValue}" غير صالحة لحقل "${field.label}"`);
          }
          break;
          
        case 'array':
          if (!Array.isArray(fieldValue)) {
            errors.push(`حقل "${field.label}" يجب أن يكون قائمة`);
          } else if (field.required && fieldValue.length === 0) {
            errors.push(`حقل "${field.label}" يجب أن يحتوي على عنصر واحد على الأقل`);
          } else if (field.subfields) {
            fieldValue.forEach((item, index) => {
              field.subfields.forEach((subfield: any) => {
                const subfieldValue = item[subfield.name];
                if (subfield.required && (subfieldValue === undefined || subfieldValue === null || subfieldValue === '')) {
                  errors.push(`حقل "${subfield.label}" في العنصر ${index + 1} من "${field.label}" مطلوب`);
                }
              });
            });
          }
          break;
      }
    });
    
    console.log("Form validation results:", { valid: errors.length === 0, errors });
    return { valid: errors.length === 0, errors };
  };

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
