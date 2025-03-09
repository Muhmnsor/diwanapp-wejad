
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { requestTypeSchema } from "./schema";
import { Separator } from "@/components/ui/separator";
import { FormFieldEditor as FieldEditor } from "./field-editor/FormFieldEditor";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

interface FormFieldEditorProps {
  form: UseFormReturn<RequestTypeFormValues>;
}

export const FormFieldEditor = ({ form }: FormFieldEditorProps) => {
  try {
    return (
      <div className="space-y-4">
        <FieldEditor form={form} />
        <Separator />
      </div>
    );
  } catch (error) {
    console.error("Error rendering FormFieldEditor:", error);
    return (
      <div className="space-y-4">
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <p className="text-red-500">حدث خطأ في تحميل محرر الحقول. يرجى المحاولة مرة أخرى.</p>
        </div>
        <Separator />
      </div>
    );
  }
};
