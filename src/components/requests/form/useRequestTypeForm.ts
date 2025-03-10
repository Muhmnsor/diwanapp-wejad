import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RequestType, WorkflowStep, FormField } from "../types";
import { requestTypeSchema, RequestTypeFormValues } from "./RequestTypeForm";

interface UseRequestTypeFormProps {
  requestType: RequestType | null;
  onRequestTypeCreated: () => void;
  onClose: () => void;
}

export const useRequestTypeForm = ({
  requestType,
  onRequestTypeCreated,
  onClose,
}: UseRequestTypeFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [currentField, setCurrentField] = useState<FormField>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
  });
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [createdRequestTypeId, setCreatedRequestTypeId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const isEditing = !!requestType;

  const form = useForm<RequestTypeFormValues>({
    resolver: zodResolver(requestTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
      form_schema: {
        fields: [],
      },
    },
  });

  useEffect(() => {
    if (requestType) {
      form.reset({
        name: requestType.name,
        description: requestType.description || "",
        is_active: requestType.is_active,
        form_schema: requestType.form_schema,
      });
      setFormFields(requestType.form_schema.fields || []);
      setCreatedRequestTypeId(requestType.id);

      const fetchWorkflowSteps = async () => {
        if (requestType.default_workflow_id) {
          try {
            const { data, error } = await supabase
              .from("workflow_steps")
              .select("*")
              .eq("workflow_id", requestType.default_workflow_id)
              .order("step_order", { ascending: true });
            
            if (error) {
              console.error("Error fetching workflow steps:", error);
              return;
            }
            
            console.log("Fetched existing workflow steps:", data);
            setWorkflowSteps(data || []);
          } catch (error) {
            console.error("Error in fetching workflow steps:", error);
          }
        }
      };
      
      fetchWorkflowSteps();
    } else {
      form.reset({
        name: "",
        description: "",
        is_active: true,
        form_schema: {
          fields: [],
        },
      });
      setFormFields([]);
      setWorkflowSteps([]);
      setCreatedRequestTypeId(null);
    }
  }, [requestType, form]);

  const resetFieldForm = () => {
    setCurrentField({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    });
    setEditingFieldIndex(null);
  };

  const handleAddField = () => {
    if (!currentField.name || !currentField.label) {
      toast.error('اسم الحقل وعنوانه مطلوبان');
      return;
    }

    const formattedName = currentField.name.replace(/\s+/g, "_").toLowerCase();
    
    const newField: FormField = {
      ...currentField,
      name: formattedName,
    };

    const updatedFields = [...formFields];

    if (editingFieldIndex !== null) {
      updatedFields[editingFieldIndex] = newField;
    } else {
      updatedFields.push(newField);
    }

    setFormFields(updatedFields);
    form.setValue("form_schema.fields", updatedFields);
    resetFieldForm();
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    form.setValue("form_schema.fields", updatedFields);
  };

  const handleEditField = (index: number) => {
    setCurrentField(formFields[index]);
    setEditingFieldIndex(index);
  };

  const handleWorkflowStepsUpdated = (steps: WorkflowStep[]) => {
    console.log("Workflow steps updated in RequestTypeDialog:", steps);
    setWorkflowSteps(steps);
  };

  const saveRequestType = async (values: RequestTypeFormValues) => {
    values.form_schema = { fields: formFields };

    // Check if we have workflow steps
    if (workflowSteps.length === 0) {
      setFormError('يجب إضافة خطوة واحدة على الأقل لسير العمل');
      throw new Error('يجب إضافة خطوة واحدة على الأقل لسير العمل');
    }

    // Use the new RPC function to bypass RLS
    const requestTypeData = {
      name: values.name,
      description: values.description || null,
      is_active: values.is_active,
      form_schema: values.form_schema,
    };

    if (isEditing && requestType) {
      // Update using RPC
      const { data, error } = await supabase.rpc('upsert_request_type', {
        request_type_data: { 
          ...requestTypeData, 
          id: requestType.id 
        },
        is_update: true
      });

      if (error) throw error;
      return data;
    } else {
      // Create using RPC
      const { data, error } = await supabase.rpc('upsert_request_type', {
        request_type_data: requestTypeData,
        is_update: false
      });

      if (error) throw error;
      return data;
    }
  };

  const createWorkflow = async (requestTypeId: string) => {
    console.log("Creating workflow for request type:", requestTypeId);
    console.log("With steps count:", workflowSteps.length);

    const workflowData = {
      name: `سير عمل ${form.getValues("name")}`,
      description: `سير عمل تلقائي لنوع الطلب: ${form.getValues("name")}`,
      is_active: true,
      request_type_id: requestTypeId
    };

    if (isEditing && requestType?.default_workflow_id) {
      // Update existing workflow using RPC
      const { data, error } = await supabase.rpc('upsert_workflow', {
        workflow_data: { 
          ...workflowData, 
          id: requestType.default_workflow_id 
        },
        is_update: true
      });

      if (error) {
        console.error("Error updating workflow:", error);
        throw error;
      }
      
      console.log("Updated existing workflow:", data);
      return data;
    } else {
      // Create new workflow using RPC
      const { data, error } = await supabase.rpc('upsert_workflow', {
        workflow_data: workflowData,
        is_update: false
      });

      if (error) {
        console.error("Error creating workflow:", error);
        throw error;
      }
      
      console.log("Created new workflow:", data);
      return data;
    }
  };

  const saveWorkflowSteps = async (workflowId: string, steps: WorkflowStep[]) => {
    if (steps.length === 0) {
      console.log("No workflow steps to save");
      setFormError('يجب إضافة خطوة واحدة على الأقل لسير العمل');
      throw new Error('يجب إضافة خطوة واحدة على الأقل لسير العمل');
    }

    console.log("Saving workflow steps for workflow:", workflowId);
    console.log("Steps to save:", steps);

    try {
      // No need to delete existing steps first, our updated RPC function handles this

      const stepsToInsert = steps.map((step, index) => ({
        workflow_id: workflowId,
        step_order: index + 1,
        step_name: step.step_name,
        step_type: step.step_type || 'decision',
        approver_id: step.approver_id,
        instructions: step.instructions,
        is_required: step.is_required === false ? false : true,
        approver_type: step.approver_type || 'user'
      }));

      console.log("Inserting workflow steps:", stepsToInsert);
      
      // Convert steps to JSON string array for RPC function
      const jsonSteps = stepsToInsert.map(step => JSON.stringify(step));
      
      // Use the improved RPC function to bypass RLS
      const { data, error } = await supabase
        .rpc('insert_workflow_steps', {
          steps: jsonSteps
        });

      if (error) {
        console.error("Error calling insert_workflow_steps RPC:", error);
        throw new Error(`فشل في إدخال خطوات سير العمل: ${error.message}`);
      }
      
      // Check the response from the function
      if (!data || !data.success) {
        const errorMessage = data?.message || data?.error || 'حدث خطأ غير معروف';
        console.error("RPC function returned an error:", errorMessage);
        throw new Error(`فشل في إدخال خطوات سير العمل: ${errorMessage}`);
      }
      
      console.log("Inserted workflow steps successfully:", data);
      return data.data;
    } catch (error) {
      console.error("Error in saveWorkflowSteps:", error);
      throw error;
    }
  };

  const updateDefaultWorkflow = async (requestTypeId: string, workflowId: string) => {
    console.log(`Updating request type ${requestTypeId} with default workflow: ${workflowId}`);
    
    // Use RPC to bypass RLS
    const { data, error } = await supabase.rpc('set_default_workflow', {
      p_request_type_id: requestTypeId,
      p_workflow_id: workflowId
    });

    if (error) {
      console.error("Error updating default workflow:", error);
      throw error;
    }
    
    console.log("Updated request type with default workflow:", data);
    return data;
  };

  const onSubmit = async (values: RequestTypeFormValues) => {
    if (formFields.length === 0) {
      setFormError("يجب إضافة حقل واحد على الأقل للنموذج");
      return;
    }

    if (workflowSteps.length === 0) {
      setFormError("يجب إضافة خطوة واحدة على الأقل لسير العمل");
      return;
    }

    setFormError(null);
    console.log("Starting form submission with workflow steps:", workflowSteps);
    
    setIsLoading(true);
    try {
      console.log("Submitting form with workflow steps count:", workflowSteps.length);
      
      // 1. Save or update the request type
      const requestTypeResult = await saveRequestType(values);
      const requestTypeId = requestTypeResult.id;
      setCreatedRequestTypeId(requestTypeId);
      
      console.log("Request type saved:", requestTypeResult);
      
      // 2. Create or update workflow
      const workflow = await createWorkflow(requestTypeId);
      
      if (workflow) {
        // 3. Make sure the request type points to the workflow first
        await updateDefaultWorkflow(requestTypeId, workflow.id);
        
        // 4. Then save workflow steps
        await saveWorkflowSteps(workflow.id, workflowSteps);

        toast.success(isEditing ? "تم تحديث نوع الطلب بنجاح" : "تم إنشاء نوع الطلب بنجاح");
        onRequestTypeCreated();
        onClose();
      }
    } catch (error) {
      console.error("Error saving request type:", error);
      toast.error(isEditing ? "حدث خطأ أثناء تحديث نوع الطلب" : "حدث خطأ أثناء إنشاء نوع الطلب");
      setFormError(`${error.message || "حدث خطأ غير متوقع أثناء العملية"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    formFields,
    currentField,
    editingFieldIndex,
    workflowSteps,
    createdRequestTypeId,
    isLoading,
    formError,
    isEditing,
    setCurrentField,
    setFormError,
    handleAddField,
    handleRemoveField,
    handleEditField,
    handleWorkflowStepsUpdated,
    onSubmit
  };
};
