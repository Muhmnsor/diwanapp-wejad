import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestType } from "../types";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

interface RequestApprovalResponse {
  id: string;
  request_id: string;
  step_id: string;
  status: string;
  request: {
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    current_step_id: string;
    request_type: {
      id: string;
      name: string;
    }[];
  }[];
  step: {
    id: string;
    step_name: string;
    step_type: string;
    approver_id: string;
  }[];
}

export const useRequests = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  const fetchIncomingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("=== بدء جلب الطلبات الواردة ===");
      console.log("معلومات المستخدم:", user.id, user.email);
      console.log("نوع المستخدم:", user.role || "غير محدد");
      console.log("هل المستخدم مدير:", user.isAdmin ? "نعم" : "لا");
      
      // First attempt: Fetch direct approvals
      const { data: directApprovals, error: directError } = await supabase
        .from("request_approvals")
        .select(`
          id,
          request_id,
          step_id,
          status,
          request:requests(
            id,
            title,
            status,
            priority,
            created_at,
            current_step_id,
            request_type:request_types(id, name)
          ),
          step:request_workflow_steps(id, step_name, step_type, approver_id)
        `)
        .eq("approver_id", user.id)
        .eq("status", "pending");
      
      if (directError) {
        console.error("خطأ في جلب الطلبات المباشرة:", directError);
        console.error("رمز الخطأ:", directError.code);
        console.error("رسالة الخطأ:", directError.message);
        
        if (directError.code === "PGRST116") {
          console.error("خطأ تكرار في الاستعلام. هذا قد يشير إلى مشكلة في سياسة RLS");
        }
      }
      
      console.log("عدد الطلبات المباشرة:", directApprovals?.length || 0);
      
      // Get user's roles for role-based approvals
      console.log("جلب أدوار المستخدم لفحص الطلبات المرتبطة بالأدوار");
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);
      
      if (rolesError) {
        console.error("خطأ في جلب أدوار المستخدم:", rolesError);
      }
      
      let roleIds: string[] = [];
      if (userRoles && userRoles.length > 0) {
        roleIds = userRoles.map(ur => ur.role_id);
        console.log("أدوار المستخدم:", roleIds);
      } else {
        console.log("المستخدم ليس لديه أدوار مخصصة");
      }
      
      // Second attempt: Fetch role-based approvals if user has roles
      let roleBased: any[] = [];
      if (roleIds.length > 0) {
        console.log("جلب الطلبات المرتبطة بأدوار المستخدم");
        
        // Get step IDs for approvals where approver_type='role' and approver_id is in user's roles
        const { data: roleSteps, error: roleStepsError } = await supabase
          .from("request_workflow_steps")
          .select("id")
          .eq("approver_type", "role")
          .in("approver_id", roleIds);
        
        if (roleStepsError) {
          console.error("خطأ في جلب خطوات الأدوار:", roleStepsError);
        } else if (roleSteps && roleSteps.length > 0) {
          console.log("خطوات سير العمل المرتبطة بالأدوار:", roleSteps.length);
          
          const stepIds = roleSteps.map(step => step.id);
          
          // Get pending approvals for these steps
          const { data: roleApprovals, error: roleApprovalsError } = await supabase
            .from("request_approvals")
            .select(`
              id,
              request_id,
              step_id,
              status,
              request:requests(
                id,
                title,
                status,
                priority,
                created_at,
                current_step_id,
                request_type:request_types(id, name)
              ),
              step:request_workflow_steps(id, step_name, step_type, approver_id)
            `)
            .in("step_id", stepIds)
            .eq("status", "pending");
          
          if (roleApprovalsError) {
            console.error("خطأ في جلب الطلبات المرتبطة بالأ��وار:", roleApprovalsError);
          } else {
            console.log("عدد الطلبات المرتبطة بالأدوار:", roleApprovals?.length || 0);
            roleBased = roleApprovals || [];
          }
        } else {
          console.log("لم يتم العثور على خطوات مرتبطة بأدوار المستخدم");
        }
      }
      
      // Combine direct and role-based approvals
      const allApprovals = [...(directApprovals || []), ...roleBased];
      console.log("إجمالي الطلبات الواردة:", allApprovals.length);
      
      // Debug details about the approvals
      if (allApprovals.length > 0) {
        console.log("تفاصيل أول طلب وارد:", JSON.stringify(allApprovals[0], null, 2));
      }
      
      // Check for RLS policy issues
      const { data: testRLS, error: rlsError } = await supabase
        .from("request_approvals")
        .select("id")
        .limit(1);
      
      if (rlsError) {
        console.error("اختبار سياسة RLS: فشل الوصول إلى جدول request_approvals:", rlsError);
      } else {
        console.log("اختبار سياسة RLS: يمكن الوصول إلى جدول request_approvals");
      }
      
      if (!allApprovals || allApprovals.length === 0) {
        console.log("لم يتم العثور على طلبات واردة للمستخدم");
        return [];
      }
      
      const requests = allApprovals.map((item: RequestApprovalResponse) => {
        const requestData = item.request && item.request.length > 0 
          ? item.request[0] 
          : null;
          
        const stepData = item.step && item.step.length > 0 
          ? item.step[0] 
          : null;
          
        if (!requestData) {
          console.warn(`تخطي الموافقة ${item.id} بسبب نقص بيانات الطلب`);
          return null;
        }
        
        let requestType = null;
        if (requestData && requestData.request_type) {
          if (Array.isArray(requestData.request_type) && requestData.request_type.length > 0) {
            requestType = requestData.request_type[0];
          }
        }
        
        return {
          ...requestData,
          request_type: requestType,
          approval_id: item.id,
          step_id: item.step_id,
          step_name: stepData ? stepData.step_name : 'Unknown Step',
          step_type: stepData ? stepData.step_type : 'decision'
        };
      }).filter(Boolean);
      
      console.log(`تم جلب ${requests.length} طلب وارد بنجاح`);
      console.log("=== انتهاء جلب الطلبات الواردة ===");
      return requests;
    } catch (error) {
      console.error("خطأ غير متوقع في fetchIncomingRequests:", error);
      return [];
    }
  };

  const fetchOutgoingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("Fetching outgoing requests for user:", user.id);
      
      try {
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_outgoing_requests', {
            p_user_id: user.id
          });
        
        if (!rpcError && rpcData) {
          console.log(`Fetched ${rpcData.length} outgoing requests via RPC`);
          
          const requestTypeIds = rpcData.map(req => req.request_type_id);
          const { data: requestTypes } = await supabase
            .from("request_types")
            .select("id, name")
            .in("id", requestTypeIds);
            
          const typeMap = Object.fromEntries(
            (requestTypes || []).map(type => [type.id, type])
          );
          
          const enrichedData = rpcData.map(req => ({
            ...req,
            request_type: typeMap[req.request_type_id] || { name: "Unknown" }
          }));
          
          return enrichedData;
        }
        
        console.error("RPC method failed:", rpcError);
      } catch (rpcErr) {
        console.error("Error using RPC method:", rpcErr);
      }
      
      console.log("Falling back to direct query for outgoing requests");
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
      
      console.log(`Fetched ${data?.length || 0} outgoing requests via direct query`);
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

  const { data: outgoingRequests, isLoading: outgoingLoading, refetch: refetchOutgoingRequests } = useQuery({
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
              .from("request_workflow_steps")
              .select("id, approver_id, approver_type")
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
        
        const { data: insertResult, error: insertError } = await supabase.rpc('insert_request_bypass_rls', {
          request_data: requestPayload
        });
        
        if (insertError) {
          console.error("Error using bypass method:", insertError);
          throw new Error(`فشل إنشاء الطلب: يبدو أن هناك مشكلة في صلاحيات الوصول. يرجى التواصل مع مسؤول النظام`);
        }
        
        if (!insertResult) {
          throw new Error("فشل إنشاء الطلب: لم يتم استلام بيانات الإنشاء");
        }
        
        console.log("Request created successfully:", insertResult);
        console.log("=== تم إنشاء الطلب بنجاح ===");
        
        if (currentStepId) {
          await createApprovalRecord(insertResult.id, currentStepId);
        }
        
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
    refetchOutgoingRequests,
    createRequest,
    approveRequest,
    rejectRequest
  };
};
