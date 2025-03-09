
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { requestTypeSchema } from "./schema";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

type RequestTypeFormValues = z.infer<typeof requestTypeSchema>;

interface RequestTypeFormProps {
  form: UseFormReturn<RequestTypeFormValues>;
  onSubmit: (values: RequestTypeFormValues) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
  isEditing: boolean;
  children?: React.ReactNode;
}

export const RequestTypeForm = ({ 
  form, 
  onSubmit, 
  isLoading, 
  onClose, 
  isEditing,
  children 
}: RequestTypeFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اسم نوع الطلب</FormLabel>
                <FormControl>
                  <Input placeholder="مثال: طلب إجازة" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وصف نوع الطلب</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="وصف مختصر لنوع الطلب وغرضه"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">نشط</FormLabel>
                  <FormDescription>
                    تحديد ما إذا كان هذا النوع من الطلبات متاحًا للاستخدام
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

        <Separator />
        
        {children}

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "جاري الحفظ..." : isEditing ? "تحديث" : "إضافة"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
