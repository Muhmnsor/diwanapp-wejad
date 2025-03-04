
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string | null;
}

interface EditTaskProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: TaskProject;
  onSuccess?: () => void;
}

const statusOptions = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "delayed", label: "متعثر" },
  { value: "completed", label: "مكتمل" },
  { value: "stopped", label: "متوقف" },
];

export const EditTaskProjectDialog = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}: EditTaskProjectDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      title: project.title,
      description: project.description || "",
      due_date: project.due_date ? project.due_date.split('T')[0] : "",
      status: project.status,
    }
  });

  // Reset form when project changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: project.title,
        description: project.description || "",
        due_date: project.due_date ? project.due_date.split('T')[0] : "",
        status: project.status,
      });
    }
  }, [isOpen, project, form]);

  const handleSubmit = async (values: any) => {
    if (!values.title.trim()) {
      toast.error("عنوان المشروع مطلوب");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("project_tasks")
        .update({
          title: values.title,
          description: values.description,
          due_date: values.due_date || null,
          status: values.status,
        })
        .eq("id", project.id);
      
      if (error) {
        throw error;
      }
      
      toast.success("تم تحديث المشروع بنجاح");
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("حدث خطأ أثناء تحديث المشروع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المشروع</DialogTitle>
          <DialogDescription>
            قم بتعديل تفاصيل المشروع أدناه
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="title" className="block text-sm font-medium">
                    عنوان المشروع
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="title"
                      placeholder="أدخل عنوان المشروع"
                      required
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="description" className="block text-sm font-medium">
                    وصف المشروع
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="أدخل وصف المشروع"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="dueDate" className="block text-sm font-medium">
                    تاريخ الاستحقاق
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="dueDate"
                      type="date"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="status" className="block text-sm font-medium">
                    الحالة
                  </FormLabel>
                  <FormControl>
                    <select
                      id="status"
                      className="w-full p-2 border rounded-md"
                      {...field}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
