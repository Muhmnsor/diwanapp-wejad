
import { useState, useEffect } from "react";
import { FormField } from "../../types";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { requestTypeSchema } from "../schema";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

export const useFormFieldEditor = (form: UseFormReturn<RequestTypeFormValues>) => {
  if (!form) {
    throw new Error("Form instance is required");
  }

  // Initialize with safe default values
  const [formFields, setFormFields] = useState<FormField[]>(() => {
    try {
      const formValues = form.getValues();
      if (!formValues) return [];
      
      const fieldsArray = formValues?.form_schema?.fields || [];
      if (!Array.isArray(fieldsArray)) return [];
      
      return fieldsArray.map(field => ({
        name: field.name || "",
        label: field.label || "",
        type: field.type || "text",
        required: field.required ?? false,
        options: Array.isArray(field.options) ? field.options : [],
        subfields: Array.isArray(field.subfields) ? field.subfields : [],
      }));
    } catch (error) {
      console.error("Error initializing form fields:", error);
      return [];
    }
  });

  const [currentField, setCurrentField] = useState<FormField>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: []
  });
  
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [currentOption, setCurrentOption] = useState("");

  // Update formFields when form values change
  useEffect(() => {
    try {
      const formValues = form.getValues();
      if (!formValues?.form_schema) return;
      
      const fieldsArray = formValues.form_schema.fields || [];
      if (!Array.isArray(fieldsArray)) return;
      
      setFormFields(fieldsArray.map(field => ({
        name: field.name || "",
        label: field.label || "",
        type: field.type || "text",
        required: field.required ?? false,
        options: Array.isArray(field.options) ? field.options : [],
        subfields: Array.isArray(field.subfields) ? field.subfields : [],
      })));
    } catch (error) {
      console.error("Error updating form fields:", error);
    }
  }, [form]);

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
    try {
      if (!currentField.name && !currentField.label) {
        return;
      }

      // Format field name from label if not provided
      const formattedName = currentField.name || 
        currentField.label.replace(/\s+/g, "_").toLowerCase();
      
      const newField: FormField = {
        ...currentField,
        name: formattedName,
      };

      // If type is array and there are no subfields defined, initialize with empty array
      if (newField.type === 'array' && !newField.subfields) {
        newField.subfields = [];
      }

      // Ensure options is an array for select/radio types
      if ((newField.type === 'select' || newField.type === 'radio') && !Array.isArray(newField.options)) {
        newField.options = [];
      }

      const updatedFields = [...formFields];

      if (editingFieldIndex !== null) {
        updatedFields[editingFieldIndex] = newField;
      } else {
        updatedFields.push(newField);
      }

      setFormFields(updatedFields);
      
      // Safely update the form value
      try {
        const currentFormSchema = form.getValues().form_schema || { fields: [] };
        form.setValue("form_schema", {
          ...currentFormSchema,
          fields: updatedFields
        }, { shouldValidate: true });
      } catch (error) {
        console.error("Error updating form value:", error);
      }
      
      resetFieldForm();
    } catch (error) {
      console.error("Error adding field:", error);
    }
  };

  const handleRemoveField = (index: number) => {
    try {
      if (index < 0 || index >= formFields.length) {
        console.error("Invalid field index:", index);
        return;
      }
      
      const updatedFields = formFields.filter((_, i) => i !== index);
      setFormFields(updatedFields);
      
      // Safely update the form value
      try {
        const currentFormSchema = form.getValues().form_schema || { fields: [] };
        form.setValue("form_schema", {
          ...currentFormSchema,
          fields: updatedFields
        }, { shouldValidate: true });
      } catch (error) {
        console.error("Error updating form value after removal:", error);
      }
    } catch (error) {
      console.error("Error removing field:", error);
    }
  };

  const handleEditField = (index: number) => {
    try {
      if (index < 0 || index >= formFields.length) {
        console.error("Invalid field index for edit:", index);
        return;
      }
      
      const fieldToEdit = formFields[index];
      setCurrentField({
        name: fieldToEdit.name || "",
        label: fieldToEdit.label || "",
        type: fieldToEdit.type || "text",
        required: fieldToEdit.required ?? false,
        options: Array.isArray(fieldToEdit.options) ? [...fieldToEdit.options] : [],
        subfields: Array.isArray(fieldToEdit.subfields) ? [...fieldToEdit.subfields] : []
      });
      setEditingFieldIndex(index);
    } catch (error) {
      console.error("Error editing field:", error);
    }
  };

  const handleAddOption = () => {
    try {
      if (!currentOption) return;
      
      const options = Array.isArray(currentField.options) ? [...currentField.options] : [];
      setCurrentField({
        ...currentField,
        options: [...options, currentOption],
      });
      setCurrentOption("");
    } catch (error) {
      console.error("Error adding option:", error);
    }
  };

  const handleRemoveOption = (index: number) => {
    try {
      const options = Array.isArray(currentField.options) ? [...currentField.options] : [];
      if (index < 0 || index >= options.length) {
        console.error("Invalid option index for removal:", index);
        return;
      }
      
      setCurrentField({
        ...currentField,
        options: options.filter((_, i) => i !== index),
      });
    } catch (error) {
      console.error("Error removing option:", error);
    }
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
