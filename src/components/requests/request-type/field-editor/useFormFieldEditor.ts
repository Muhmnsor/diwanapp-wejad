
import { useState } from "react";
import { FormField } from "../../types";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { requestTypeSchema } from "../schema";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

export const useFormFieldEditor = (form: UseFormReturn<RequestTypeFormValues>) => {
  const [formFields, setFormFields] = useState<FormField[]>(
    form.getValues().form_schema?.fields?.map(field => ({
      name: field.name || "",
      label: field.label || "",
      type: field.type || "text",
      required: field.required ?? false,
      options: field.options || [],
      subfields: field.subfields || [],
    })) || []
  );

  const [currentField, setCurrentField] = useState<FormField>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: []
  });
  
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [currentOption, setCurrentOption] = useState("");

  const resetFieldForm = () => {
    setCurrentField({
      name: "",
      label: "",
      type: "text",
      required: false,
      options: []
    });
    setEditingFieldIndex(null);
    setCurrentOption("");
  };

  const handleAddField = () => {
    if (!currentField.name || !currentField.label) {
      return;
    }

    const formattedName = currentField.name.replace(/\s+/g, "_").toLowerCase();
    
    const newField: FormField = {
      ...currentField,
      name: formattedName,
    };

    // If type is array and there are no subfields defined, initialize with empty array
    if (newField.type === 'array' && !newField.subfields) {
      newField.subfields = [];
    }

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

  const handleAddOption = () => {
    if (!currentOption) return;
    
    const options = currentField.options || [];
    setCurrentField({
      ...currentField,
      options: [...options, currentOption],
    });
    setCurrentOption("");
  };

  const handleRemoveOption = (index: number) => {
    const options = currentField.options || [];
    setCurrentField({
      ...currentField,
      options: options.filter((_, i) => i !== index),
    });
  };

  return {
    formFields,
    currentField,
    setCurrentField,
    editingFieldIndex,
    currentOption,
    setCurrentOption,
    handleAddField,
    handleRemoveField,
    handleEditField,
    handleAddOption,
    handleRemoveOption
  };
};
