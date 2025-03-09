
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
  return (
    <div className="space-y-4">
      <FieldEditor form={form} />
      <Separator />
    </div>
  );
};
