
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { requestTypeSchema } from "../schema";
import { FieldForm } from "./FieldForm";
import { FieldsList } from "./FieldsList";
import { useFormFieldEditor } from "./useFormFieldEditor";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

interface FormFieldEditorProps {
  form: UseFormReturn<RequestTypeFormValues>;
}

export const FormFieldEditor = ({ form }: FormFieldEditorProps) => {
  const {
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
  } = useFormFieldEditor(form);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">نموذج البيانات</h3>
      <p className="text-sm text-muted-foreground">
        قم بتحديد الحقول المطلوبة في نموذج الطلب
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldForm
          currentField={currentField}
          setCurrentField={setCurrentField}
          handleAddField={handleAddField}
          editingFieldIndex={editingFieldIndex}
          currentOption={currentOption}
          setCurrentOption={setCurrentOption}
          handleAddOption={handleAddOption}
          handleRemoveOption={handleRemoveOption}
        />

        <div className="border rounded-md p-4">
          <h4 className="font-medium mb-2">الحقول المضافة</h4>
          <FieldsList
            formFields={formFields}
            handleEditField={handleEditField}
            handleRemoveField={handleRemoveField}
          />
        </div>
      </div>
    </div>
  );
};
