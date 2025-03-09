
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

  // Helper function to handle file uploads
  const handleFileUploads = async (formData: Record<string, any>): Promise<Record<string, any>> => {
    const processedData = { ...formData };
    
    // Find file fields in the form data
    for (const [key, value] of Object.entries(formData)) {
      if (value instanceof File) {
        console.log(`Uploading file for field ${key}:`, value);
        
        try {
          // Generate a unique file name
          const fileExt = value.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${user!.id}/${fileName}`;
          
          // Upload file to Supabase storage
          const { data, error } = await supabase.storage
            .from('request-attachments')
            .upload(filePath, value);
          
          if (error) {
            console.error(`Error uploading file for ${key}:`, error);
            throw new Error(`فشل في رفع الملف: ${error.message}`);
          }
          
          // Get public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('request-attachments')
            .getPublicUrl(filePath);
          
          // Replace the file object with the file path and metadata
          processedData[key] = {
            name: value.name,
            size: value.size,
            type: value.type,
            url: publicUrl,
            path: filePath
          };
          
          console.log(`File uploaded successfully for ${key}:`, publicUrl);
        } catch (error) {
          console.error(`Error in file upload for ${key}:`, error);
          throw error;
        }
      } else if (value && typeof value === 'object' && value._type === 'file') {
        // Handle already processed file object from form
        console.log(`Processing existing file object for ${key}:`, value);
      }
    }
    
    return processedData;
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
        console.log("Creating request with provided data:", requestData);
        
        // Fetch the request type to get form schema
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
        
        // Process and upload any files in the form data
        const processedFormData = await handleFileUploads(requestData.form_data);
        
        // Validate processed form data against the schema
        const formSchema = requestType.form_schema;
        const validationResult = validateFormData(processedFormData, formSchema);
        
        if (!validationResult.valid) {
          console.error("Form data validation failed:", validationResult.errors);
          throw new Error(`Form validation failed: ${validationResult.errors.join(", ")}`);
        }
        
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
            throw new Error(`Failed to fetch workflow step: ${stepError.message}`);
          }
          
          if (firstStep) {
            currentStepId = firstStep.id;
          }
        }
        
        console.log("Creating request with processed data:", {
          requester_id: user.id,
          workflow_id: workflowId,
          current_step_id: currentStepId,
          form_data: processedFormData,
          ...requestData,
          form_data: processedFormData
        });
        
        // Create request
        const { data, error } = await supabase
          .from("requests")
          .insert({
            requester_id: user.id,
            workflow_id: workflowId,
            current_step_id: currentStepId,
            ...requestData,
            form_data: processedFormData
          })
          .select();

        if (error) {
          console.error("Error creating request:", error);
          if (error.code === '42P17') {
            throw new Error("حدث خطأ في سياسات أمان قاعدة البيانات. الرجاء التواصل مع المسؤول");
          } else {
            throw new Error(`Failed to create request: ${error.message}`);
          }
        }
        
        if (!data || data.length === 0) {
          throw new Error("Failed to create request: No data returned");
        }
        
        console.log("Request created successfully:", data[0]);
        
        // If there's a current step, create approval record
        if (currentStepId) {
          const { data: step, error: fetchStepError } = await supabase
            .from("workflow_steps")
            .select("approver_id")
            .eq("id", currentStepId)
            .single();
          
          if (fetchStepError) {
            console.error("Error fetching step info:", fetchStepError);
            // Continue despite error, as request is already created
          } else if (step && step.approver_id) {
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
              // Continue despite error, as request is already created
            }
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

  // Function to validate form data against schema
  const validateFormData = (formData: Record<string, any>, schema: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const fields = schema?.fields || [];
    
    if (!fields || fields.length === 0) {
      console.warn("No fields defined in schema for validation");
      return { valid: true, errors: [] };
    }
    
    // Check that all required fields are present and have valid values
    fields.forEach((field: any) => {
      const fieldName = field.name;
      const fieldValue = formData[fieldName];
      
      // Check if required field exists
      if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
        errors.push(`حقل "${field.label}" مطلوب`);
        return;
      }
      
      // Skip validation for empty optional fields
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        return;
      }
      
      // Type-specific validations
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
          
        case 'file':
          // For file fields, check if we have a valid file object or metadata
          if (fieldValue) {
            if (typeof fieldValue !== 'object') {
              errors.push(`حقل "${field.label}" يجب أن يكون ملفاً`);
            } 
            // If it's a processed file object with url/path, it's valid
            else if (!fieldValue.url && !fieldValue.path && !(fieldValue instanceof File)) {
              errors.push(`صيغة الملف في حقل "${field.label}" غير صالحة`);
            }
          }
          break;
          
        case 'array':
          if (!Array.isArray(fieldValue)) {
            errors.push(`حقل "${field.label}" يجب أن يكون قائمة`);
          } else if (field.required && fieldValue.length === 0) {
            errors.push(`حقل "${field.label}" يجب أن يحتوي على عنصر واحد على الأقل`);
          } else if (field.subfields) {
            // Validate each item in the array
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
