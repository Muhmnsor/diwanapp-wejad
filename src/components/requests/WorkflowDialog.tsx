import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestType, RequestWorkflow } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const workflowSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يحتوي الاسم على 3 أحرف على الأقل" }),
  description: z.string().optional(),
  request_type_id: z.string().min(1, { message: "يرجى اختيار نوع الطلب" }),
  is_active: z.boolean().default(true),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

interface WorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTypeId?: string | null;
  onWorkflowCreated: () => void;
}

export const WorkflowDialog = ({
  isOpen,
  onClose,
  selectedTypeId,
  onWorkflowCreated,
}: WorkflowDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
      request_type_id: selectedTypeId || "",
      is_active: true,
    },
  });

  useEffect(() => {
    const fetchRequestTypes = async () => {
      try {
        const { data, error } = await supabase
          .from("request_types")
          .select("*")
          .order("name");

        if (error) throw error;
        setRequestTypes(data || []);
      } catch (error) {
        console.error("Error fetching request types:", error);
        toast.error("حدث خطأ أثناء تحميل أنواع الطلبات");
      }
    };

    if (isOpen) {
      fetchRequestTypes();
      form.reset({
        name: "",
        description: "",
        request_type_id: selectedTypeId || "",
        is_active: true,
      });
    }
  }, [isOpen, selectedTypeId, form]);

  const onSubmit = async (values: WorkflowFormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("request_workflows")
        .insert([
          {
            name: values.name,
            description: values.description || null,
            request_type_id: values.request_type_id,
            is_active: values.is_active,
          },
        ])
        .select();

      if (error) throw error;

      toast.success("تم إنشاء مسار العمل بنجاح");
      onWorkflowCreated();
      onClose();
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("حدث خطأ أثناء إنشاء مسار العمل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة مسار عمل جديد</DialogTitle>
          <DialogDescription>
            أنشئ مسار عمل جديد للطلبات وقم بتحديد نوع الطلب المرتبط به
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم مسار العمل</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم مسار العمل" {...field} />
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
                  <FormLabel>الوصف</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل وصفاً لمسار العمل (اختياري)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="request_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الطلب</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الطلب" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {requestTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>نشط</FormLabel>
                    <FormDescription>
                      تفعيل أو تعطيل مسار العمل
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

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "جارٍ الإنشاء..." : "إنشاء مسار العمل"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
