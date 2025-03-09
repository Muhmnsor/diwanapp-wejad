
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Request, RequestType } from "../types";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useFileUpload } from "./useFileUpload";
import { validateFormData } from "../utils/formValidator";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export const useRequests = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { processFormFiles, isUploading, uploadProgress } = useFileUpload();
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [submissionStep, setSubmissionStep] = useState<string>("");
  
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
        console.log("No approver steps found for user:", user.id);
        return [];
      }
      
      const stepIds = approverSteps.map(step => step.id);
      console.log("Found approver step IDs:", stepIds);
      
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
        
        if (error.message.includes("permission denied")) {
          throw new Error("ليس لديك صلاحية للوصول إلى هذه البيانات");
        }
        
        return [];
      }
      
      console.log("Fetched incoming requests:", data?.length || 0);
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
        
        if (error.message.includes("permission denied")) {
          throw new Error("ليس لديك صلاحية للوصول إلى هذه البيانات");
        }
        
        return [];
      }
      
      console.log("Fetched outgoing requests:", data?.length || 0);
      return data || [];
    } catch (error) {
      console.error("Error in fetchOutgoingRequests:", error);
      return [];
    }
  };

  const { data: incomingRequests, isLoading: incomingLoading } = useQuery({
    queryKey: ["requests", "incoming"],
    queryFn: fetchIncomingRequests,
    enabled: !!user,
    retry: 1, // Only retry once
    retryDelay: 2000 // Wait 2 seconds before retry
  });

  const { data: outgoingRequests, isLoading: outgoingLoading } = useQuery({
    queryKey: ["requests", "outgoing"],
    queryFn: fetchOutgoingRequests,
    enabled: !!user,
    retry: 1, // Only retry once
    retryDelay: 2000 // Wait 2 seconds before retry
  });

  const performDatabaseInsert = async (insertData: any, retryCount = 0): Promise<any> => {
    try {
      setSubmissionStep("إرسال البيانات لقاعدة البيانات");
      console.log(`Creating request (attempt ${retryCount + 1})`, JSON.stringify(insertData, null, 2));
      
      // Log the auth state - important for debugging
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Error getting session during request submission:", sessionError);
      } else {
        console.log("Current session during request submission:", 
          session ? `Authenticated as ${session.user.id}` : "No active session");
      }
      
      // IMPORTANT: Ensure requester_id is set to the current user's ID
      if (!insertData.requester_id && session?.user?.id) {
        console.log("Setting requester_id to current user:", session.user.id);
        insertData.requester_id = session.user.id;
      }
      
      // Use .select() to return the inserted data
      const { data, error } = await supabase
        .from("requests")
        .insert(insertData)
        .select();

      if (error) {
        console.error(`Error creating request (attempt ${retryCount + 1}):`, error);
        console.error("Request data that caused error:", JSON.stringify(insertData, null, 2));
        
        // More specific error messages
        if (error.code === '23503') {
          throw new Error(`خطأ في العلاقات بين الجداول. يرجى التحقق من صحة البيانات المدخلة.\nرمز الخطأ: ${error.code}\nتفاصيل: ${error.message || 'غير معروف'}`);
        } else if (error.code === '23505') {
          throw new Error(`الطلب موجود بالفعل.\nرمز الخطأ: ${error.code}\nتفاصيل: ${error.message || 'غير معروف'}`);
        } else if (error.code === '42501') {
          throw new Error(`ليس لديك صلاحية لإنشاء هذا الطلب.\nرمز الخطأ: ${error.code}\nتفاصيل: ${error.message || 'غير معروف'}\nيرجى التأكد من تسجيل الدخول مرة أخرى.`);
        } else if (error.code === '42P01') {
          throw new Error(`خطأ في قاعدة البيانات: الجدول غير موجود.\nرمز الخطأ: ${error.code}\nتفاصيل: ${error.message || 'غير معروف'}`);
        } else if (error.message?.includes('infinite recursion')) {
          throw new Error(`خطأ في سياسات أمان قاعدة البيانات. يرجى التواصل مع مدير النظام.`);
        } else if (error.message?.includes('violates row-level security policy')) {
          throw new Error(`خطأ في الصلاحيات: تأكد من تسجيل الدخول وأن لديك صلاحية إنشاء الطلبات.`);
        } else if (retryCount < MAX_RETRIES) {
          // Retry with exponential backoff
          const delayTime = RETRY_DELAY * Math.pow(2, retryCount);
          console.log(`Retrying after ${delayTime}ms...`);
          setSubmissionStep(`إعادة المحاولة (${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, delayTime));
          return performDatabaseInsert(insertData, retryCount + 1);
        } else {
          // If we've exhausted retries, throw the error
          throw new Error(`فشل إنشاء الطلب بعد ${MAX_RETRIES} محاولات.`);
        }
      }
      
      if (!data || data.length === 0) {
        throw new Error("تم إنشاء الطلب ولكن لم يتم استرجاع البيانات");
      }
      
      console.log("Request created successfully:", data[0]);
      return data[0];
    } catch (error) {
      console.error("Error in performDatabaseInsert:", error);
      throw error;
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
      requester_id?: string;
    }) => {
      if (!user) throw new Error("يجب تسجيل الدخول لإنشاء طلب جديد");
      setSubmissionSuccess(false);
      setDetailedError(null);
      setSubmissionStep("التحقق من صحة البيانات");
      
      try {
        console.log("Starting request creation process with data:", requestData);
        
        // Verify user authentication explicitly
        setSubmissionStep("التحقق من جلسة المستخدم");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("جلسة المستخدم غير موجودة. يرجى تسجيل الدخول مرة أخرى");
        }
        
        console.log("User is authenticated as:", user.id);
        console.log("Session user ID:", session.user.id);
        
        // CRITICAL: Ensure requester_id is set to the current user's ID
        requestData.requester_id = session.user.id;
        
        // Fetch the request type to get form schema
        setSubmissionStep("جلب معلومات نوع الطلب");
        const { data: requestType, error: typeError } = await supabase
          .from("request_types")
          .select("default_workflow_id, form_schema")
          .eq("id", requestData.request_type_id)
          .single();
        
        if (typeError) {
          console.error("Error fetching request type:", typeError);
          throw new Error(`فشل في العثور على نوع الطلب: ${typeError.message}`);
        }
        
        if (!requestType) {
          throw new Error("نوع الطلب غير موجود");
        }
        
        // Validate form data before uploading files
        setSubmissionStep("التحقق من صحة بيانات النموذج");
        const formSchema = requestType.form_schema;
        const validationResult = validateFormData(requestData.form_data, formSchema);
        
        if (!validationResult.valid) {
          console.error("Form data validation failed:", validationResult.errors);
          throw new Error(`تحقق من البيانات المدخلة: ${validationResult.errors.join(", ")}`);
        }
        
        // Process and upload any files in the form data
        setSubmissionStep("معالجة وتحميل الملفات");
        const processedFormData = await processFormFiles(requestData.form_data, user.id);
        
        console.log("Form data processed successfully, preparing workflow data");
        
        setSubmissionStep("إعداد سير العمل");
        const workflowId = requestType.default_workflow_id;
        let currentStepId = null;
        
        if (workflowId) {
          // Get first step of workflow
          const { data: firstStep, error: stepError } = await supabase
            .from("workflow_steps")
            .select("id, approver_id")
            .eq("workflow_id", workflowId)
            .eq("step_order", 1)
            .single();
          
          if (stepError && !stepError.message.includes("No rows found")) {
            console.error("Error fetching first step:", stepError);
            throw new Error(`فشل في العثور على خطوة سير العمل: ${stepError.message}`);
          }
          
          if (firstStep) {
            currentStepId = firstStep.id;
            console.log("Found workflow first step:", firstStep);
          }
        }
        
        // Prepare request data - CRITICAL: Set requester_id to current user's ID
        const insertData = {
          requester_id: session.user.id, // Use the session user ID to ensure current user
          workflow_id: workflowId,
          current_step_id: currentStepId,
          request_type_id: requestData.request_type_id,
          title: requestData.title,
          priority: requestData.priority || 'medium',
          form_data: processedFormData,
          status: 'pending'
        };
        
        console.log("Request insert data prepared:", insertData);
        console.log("User ID for this request:", session.user.id);
        
        // Perform the insert operation with retry logic
        const insertedRequest = await performDatabaseInsert(insertData);
        
        // If there's a current step, create approval record
        if (currentStepId && insertedRequest) {
          setSubmissionStep("إنشاء سجل الموافقة");
          console.log("Creating approval record for request:", insertedRequest.id);
          
          const { data: step, error: fetchStepError } = await supabase
            .from("workflow_steps")
            .select("approver_id")
            .eq("id", currentStepId)
            .single();
          
          if (fetchStepError) {
            console.error("Error fetching step info:", fetchStepError);
            // Continue despite error, as request is already created
          } else if (step && step.approver_id) {
            try {
              const { error: approvalError } = await supabase
                .from("request_approvals")
                .insert({
                  request_id: insertedRequest.id,
                  step_id: currentStepId,
                  approver_id: step.approver_id,
                  status: "pending"
                });
              
              if (approvalError) {
                console.error("Error creating approval:", approvalError);
                // Continue despite error, as request is already created
              } else {
                console.log("Approval record created successfully");
              }
            } catch (approvalInsertError) {
              console.error("Exception during approval creation:", approvalInsertError);
              // Continue since the main request was created
            }
          }
        }
        
        setSubmissionStep("اكتمال العملية");
        setSubmissionSuccess(true);
        console.log("Request creation completed successfully!");
        return insertedRequest;
      } catch (error) {
        console.error("Error in createRequest:", error);
        
        // Store detailed error information
        if (error instanceof Error) {
          setDetailedError(error.message);
        } else {
          setDetailedError("حدث خطأ غير معروف أثناء إنشاء الطلب");
        }
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      toast.success("تم إنشاء الطلب بنجاح وحفظه في قاعدة البيانات");
    },
    onError: (error: any) => {
      console.error("Error creating request (from mutation handler):", error);
      toast.error(error.message || "حدث خطأ أثناء إنشاء الطلب");
    }
  });

  const approveRequest = useMutation({
    mutationFn: async ({ requestId, stepId, comments }: { requestId: string, stepId: string, comments?: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      try {
        console.log("Approving request:", { requestId, stepId, comments });
        
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
          throw new Error(`Failed to create approval record: ${approvalError.message}`);
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
          throw new Error(`Failed to fetch request: ${requestError.message}`);
        }
        
        // Try to find next step
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
            // Continue despite error
          }
        }
        
        // Update request
        const { error: updateError } = await supabase
          .from("requests")
          .update(updateData)
          .eq("id", requestId);
        
        if (updateError) {
          console.error("Error updating request:", updateError);
          throw new Error(`Failed to update request: ${updateError.message}`);
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
          throw new Error(`Failed to create rejection record: ${rejectionError.message}`);
        }
        
        // Update request status
        const { error: updateError } = await supabase
          .from("requests")
          .update({ status: "rejected" })
          .eq("id", requestId);
        
        if (updateError) {
          console.error("Error updating request:", updateError);
          throw new Error(`Failed to update request: ${updateError.message}`);
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
        toast.error(error.message || "حدث خطأ أثناء رفض الطلب");
      }
    }
  });

  return {
    incomingRequests,
    outgoingRequests,
    incomingLoading,
    outgoingLoading,
    createRequest,
    isUploading,
    uploadProgress,
    submissionSuccess,
    detailedError,
    submissionStep,
    approveRequest,
    rejectRequest
  };
};
