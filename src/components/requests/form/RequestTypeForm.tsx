
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RequestTypeFormValues } from "../types";

export const requestTypeSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يحتوي الاسم على 3 أحرف على الأقل" }),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  form_schema: z.object({
    fields: z.array(
      z.object({
        name: z.string().min(1, { message: "اسم الحقل مطلوب" }),
        label: z.string().min(1, { message: "عنوان الحقل مطلوب" }),
        type: z.enum(['text', 'textarea', 'number', 'date', 'select', 'array', 'file']),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(),
      })
    ),
  }).default({ fields: [] }),
});

interface RequestTypeFormProps {
  form: ReturnType<typeof useForm<RequestTypeFormValues>>;
}

export const RequestTypeForm: React.FC<RequestTypeFormProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم نوع الطلب</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم نوع الطلب" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-[72px]">
              <div className="space-y-0.5">
                <FormLabel>نشط</FormLabel>
                <FormDescription>
                  تفعيل أو تعطيل نوع الطلب
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>الوصف</FormLabel>
            <FormControl>
              <Textarea
                placeholder="أدخل وصفاً لنوع الطلب (اختياري)"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
