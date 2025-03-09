
import { z } from "zod";

// Define the form field schema recursively to allow for nested subfields
const formFieldSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    name: z.string().min(1, { message: "اسم الحقل مطلوب" }),
    label: z.string().min(1, { message: "عنوان الحقل مطلوب" }),
    type: z.enum(['text', 'textarea', 'number', 'date', 'select', 'array', 'file']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    subfields: z.array(formFieldSchema).optional(),
  })
);

export const requestTypeSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يحتوي الاسم على 3 أحرف على الأقل" }),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  form_schema: z.object({
    fields: z.array(formFieldSchema).default([]),
  }).default({ fields: [] }),
});
