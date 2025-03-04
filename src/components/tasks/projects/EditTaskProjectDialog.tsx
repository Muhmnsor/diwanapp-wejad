
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
import { Label } from "@/components/ui/label";
import { ClipboardList } from "lucide-react";

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
      start_date: "",
      end_date: project.due_date ? project.due_date.split('T')[0] : "",
      status: project.status,
    }
  });

  // Reset form when project changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: project.title,
        description: project.description || "",
        start_date: "",
        end_date: project.due_date ? project.due_date.split('T')[0] : "",
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
          due_date: values.end_date || null,
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="title" className="text-right block">اسم المشروع</FormLabel>
                    <FormControl>
                      <Input
                        id="title"
                        placeholder="أدخل اسم المشروع"
                        required
                        className="text-right"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="description" className="text-right block">وصف المشروع</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="أدخل وصف المشروع"
                        rows={4}
                        className="text-right"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="space-y-2 md:order-1">
                    <FormLabel htmlFor="start_date" className="text-right block">تاريخ البداية</FormLabel>
                    <FormControl>
                      <Input
                        id="start_date"
                        type="date"
                        className="text-right"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="space-y-2 md:order-2">
                    <FormLabel htmlFor="end_date" className="text-right block">تاريخ النهاية</FormLabel>
                    <FormControl>
                      <Input
                        id="end_date"
                        type="date"
                        className="text-right"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel htmlFor="status" className="text-right block">الحالة</FormLabel>
                  <FormControl>
                    <select
                      id="status"
                      className="w-full p-2 border rounded-md text-right"
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

            <DialogFooter className="flex justify-start gap-2 mt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                {isSubmitting ? "جاري التحديث..." : "تحديث المشروع"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
