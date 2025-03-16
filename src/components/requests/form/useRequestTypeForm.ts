
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RequestType, FormField, FormSchema } from "../types";
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
        is_active: requestType.is_active !== undefined ? requestType.is_active : true,
        form_schema: {
          fields: (requestType.form_schema?.fields || []) as any,
        },
      });
      setFormFields(requestType.form_schema?.fields || []);
      setCreatedRequestTypeId(requestType.id);
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
      setCreatedRequestTypeId(null);
    }
  }, [requestType, form]);

  const resetFieldForm = () => {
    setCurrentField({
      id: uuidv4(),
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
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = formFields.filter((_, i) => i !== index);
    setFormFields(updatedFields);
    form.setValue("form_schema.fields", updatedFields as any);
  };

  const handleEditField = (index: number) => {
    setCurrentField(formFields[index]);
    setEditingFieldIndex(index);
  };

  const saveRequestType = async (values: RequestTypeFormValues) => {
    const formSchemaWithFields: FormSchema = {
      fields: formFields,
    };
    
    // Cast the type to appease TypeScript while maintaining the runtime values
    const requestTypeData = {
      name: values.name,
      description: values.description || null,
      is_active: values.is_active,
      form_schema: formSchemaWithFields as any,
    };

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

  const onSubmit = async (values: RequestTypeFormValues) => {
    if (formFields.length === 0) {
      setFormError("يجب إضافة حقل واحد على الأقل للنموذج");
      return;
    }

    setFormError(null);
    setIsLoading(true);
    
    try {
      const requestTypeResult = await saveRequestType(values);
      setCreatedRequestTypeId(requestTypeResult.id);
      
      toast.success(isEditing ? "تم تحديث نوع الطلب بنجاح" : "تم إنشاء نوع الطلب بنجاح");
      onRequestTypeCreated();
      onClose();
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
    createdRequestTypeId,
    isLoading,
    formError,
    isEditing,
    setCurrentField,
    setFormError,
    handleAddField,
    handleRemoveField,
    handleEditField,
    onSubmit
  };
};
