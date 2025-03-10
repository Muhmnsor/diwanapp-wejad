
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RequestType, WorkflowStep, FormField, FormSchema } from "../types";
import { requestTypeSchema, RequestTypeFormValues } from "./RequestTypeForm";
import { v4 as uuidv4 } from "uuid";

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
    id: uuidv4(),
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

  console.log("useRequestTypeForm initialization with requestType:", requestType?.id);

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

  const resetFieldForm = useCallback(() => {
    setCurrentField({
      id: uuidv4(),
      name: "",
      label: "",
      type: "text",
      required: false,
      options: [],
    });
    setEditingFieldIndex(null);
  }, []);

  const resetForm = useCallback(() => {
    console.log("Resetting the form");
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
    setFormError(null);
    resetFieldForm();
  }, [form, resetFieldForm]);

  useEffect(() => {
    if (requestType) {
      console.log("Initializing form with requestType:", requestType.id);
      form.reset({
        name: requestType.name,
        description: requestType.description || "",
        is_active: requestType.is_active !== false, // Default to true if undefined
        form_schema: requestType.form_schema,
      });
      setFormFields(requestType.form_schema.fields || []);
      setCreatedRequestTypeId(requestType.id);

      const fetchWorkflowSteps = async () => {
        if (requestType.default_workflow_id) {
          try {
            console.log("Fetching workflow steps for:", requestType.default_workflow_id);
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
            
            if (data && data.length > 0) {
              const stepsWithWorkflowId = data.map(step => ({
                ...step,
                workflow_id: step.workflow_id || requestType.default_workflow_id
              }));
              
              setWorkflowSteps(stepsWithWorkflowId);
            } else {
              console.log("No workflow steps found, setting empty array");
              setWorkflowSteps([]);
            }
          } catch (error) {
            console.error("Error in fetching workflow steps:", error);
          }
        } else {
          console.log("No default workflow ID, setting empty steps array");
          setWorkflowSteps([]);
        }
      };
      
      fetchWorkflowSteps();
    } else {
      console.log("No requestType, resetting form");
      resetForm();
    }
  }, [requestType, form, resetForm]);

  const handleAddField = useCallback(() => {
    if (!currentField.name || !currentField.label) {
      toast.error('اسم الحقل وعنوانه مطلوبان');
      return;
    }

    try {
      const formattedName = currentField.name.replace(/\s+/g, "_").toLowerCase();
      
      const newField: FormField = {
        ...currentField,
        id: currentField.id || uuidv4(),
        name: formattedName,
      };

      const updatedFields = [...formFields];

      if (editingFieldIndex !== null) {
        updatedFields[editingFieldIndex] = newField;
      } else {
        updatedFields.push(newField);
      }

      setFormFields(updatedFields);
      form.setValue("form_schema.fields", updatedFields as any);
      resetFieldForm();
    } catch (error) {
      console.error("Error adding field:", error);
      toast.error('حدث خطأ أثناء إضافة الحقل');
      setFormError('حدث خطأ أثناء إضافة الحقل');
    }
  }, [currentField, editingFieldIndex, formFields, form, resetFieldForm]);

  const handleRemoveField = useCallback((index: number) => {
    try {
      const updatedFields = formFields.filter((_, i) => i !== index);
      setFormFields(updatedFields);
      form.setValue("form_schema.fields", updatedFields as any);
    } catch (error) {
      console.error("Error removing field:", error);
      toast.error('حدث خطأ أثناء إزالة الحقل');
    }
  }, [formFields, form]);

  const handleEditField = useCallback((index: number) => {
    try {
      setCurrentField(formFields[index]);
      setEditingFieldIndex(index);
    } catch (error) {
      console.error("Error editing field:", error);
      toast.error('حدث خطأ أثناء تعديل الحقل');
    }
  }, [formFields]);

  const handleWorkflowStepsUpdated = useCallback((steps: WorkflowStep[]) => {
    console.log("Workflow steps updated in RequestTypeDialog:", steps);
    
    if (steps.some(step => !step.workflow_id)) {
      console.warn("Some workflow steps are missing workflow_id");
      
      const fixedSteps = steps.map(step => ({
        ...step,
        workflow_id: step.workflow_id || (requestType?.default_workflow_id || 'temp-workflow-id')
      }));
      
      setWorkflowSteps(fixedSteps);
    } else {
      setWorkflowSteps(steps);
    }
  }, [requestType?.default_workflow_id]);

  const saveRequestType = async (values: RequestTypeFormValues) => {
    const formSchemaWithFields: FormSchema = {
      fields: formFields,
    };
    
    values.form_schema = formSchemaWithFields;

    if (workflowSteps.length === 0) {
      setFormError('يجب إضافة خطوة واحدة على الأقل لسير العمل');
      throw new Error('يجب إضافة خطوة واحدة على الأقل لسير العمل');
    }

    const requestTypeData = {
      name: values.name,
      description: values.description || null,
      is_active: values.is_active,
      form_schema: formSchemaWithFields,
    };

    console.log("Saving request type:", isEditing ? "update" : "create", requestTypeData);

    if (isEditing && requestType) {
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
      console.log("Updating existing workflow:", requestType.default_workflow_id);
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
      console.log("Creating new workflow");
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
      const stepsWithWorkflowId = steps.map((step, index) => ({
        ...step,
        workflow_id: workflowId,
        step_order: index + 1,
        step_type: step.step_type || 'decision',
        is_required: step.is_required === false ? false : true,
        approver_type: step.approver_type || 'user'
      }));
      
      console.log("Prepared steps with workflow ID:", stepsWithWorkflowId);
      
      const jsonSteps = stepsWithWorkflowId.map(step => JSON.stringify(step));
      
      console.log("JSON steps for RPC:", jsonSteps);
      
      const { data, error } = await supabase
        .rpc('insert_workflow_steps', {
          steps: jsonSteps
        });

      if (error) {
        console.error("Error calling insert_workflow_steps RPC:", error);
        throw new Error(`فشل في إدخال خطوات سير العمل: ${error.message}`);
      }
      
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
    
    if (workflowSteps.some(step => !step.approver_id)) {
      setFormError("جميع خطوات سير العمل يجب أن تحتوي على معتمد");
      return;
    }

    setFormError(null);
    console.log("Starting form submission with workflow steps:", workflowSteps);
    
    setIsLoading(true);
    try {
      console.log("Submitting form with workflow steps count:", workflowSteps.length);
      
      const requestTypeResult = await saveRequestType(values);
      const requestTypeId = requestTypeResult.id;
      setCreatedRequestTypeId(requestTypeId);
      
      console.log("Request type saved:", requestTypeResult);
      
      const workflow = await createWorkflow(requestTypeId);
      
      if (workflow) {
        const workflowId = workflow.id;
        
        const updatedSteps = workflowSteps.map(step => ({
          ...step,
          workflow_id: workflowId
        }));
        
        console.log("Steps with updated workflow ID:", updatedSteps);
        
        await updateDefaultWorkflow(requestTypeId, workflowId);
        
        await saveWorkflowSteps(workflowId, updatedSteps);

        toast.success(isEditing ? "تم تحديث نوع الطلب بنجاح" : "تم إنشاء نوع الطلب بنجاح");
        console.log("Successfully saved request type and workflow");
        
        setTimeout(() => {
          onRequestTypeCreated();
          resetForm();
          onClose();
        }, 500);
      }
    } catch (error: any) {
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
    onSubmit,
    resetForm
  };
};
