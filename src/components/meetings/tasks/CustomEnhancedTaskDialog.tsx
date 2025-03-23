
import React from "react";
import { EnhancedTaskCreationDialog } from "./EnhancedTaskCreationDialog";
import { UserSelector } from "./UserSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { useTaskTemplates } from "@/hooks/meetings/useTaskTemplates";
import { AddTemplateButton } from "./AddTemplateButton";
import { TaskType, TaskStatus } from "@/types/meeting";

interface CustomEnhancedTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  title: z.string().min(1, { message: "العنوان مطلوب" }),
  description: z.string().optional(),
  task_type: z.enum(["action_item", "follow_up", "decision", "preparation", "execution", "other"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]),
  add_to_general_tasks: z.boolean().default(false),
  requires_deliverable: z.boolean().default(false),
});

export const CustomEnhancedTaskDialog: React.FC<CustomEnhancedTaskDialogProps> = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess
}) => {
  // Use our existing hook for handling template uploads
  const { templates, setTemplates, uploadTemplates } = useTaskTemplates();
  
  // Use the mutation hook to create a task
  const { mutate: createTask, isPending } = useCreateMeetingTask();
  
  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      task_type: "action_item" as TaskType,
      status: "pending" as TaskStatus,
      assigned_to: "",
      due_date: "",
      priority: "medium",
      add_to_general_tasks: false,
      requires_deliverable: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    createTask({
      meeting_id: meetingId,
      ...values,
      templates
    }, {
      onSuccess: async (data) => {
        // Upload templates if present
        if (templates && templates.length > 0) {
          await uploadTemplates(data.id);
        }
        
        form.reset();
        setTemplates(null);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان المهمة</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان المهمة" {...field} />
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
                  <FormLabel>وصف المهمة</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف المهمة" {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="task_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع المهمة</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المهمة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="action_item">إجراء</SelectItem>
                        <SelectItem value="follow_up">متابعة</SelectItem>
                        <SelectItem value="decision">قرار</SelectItem>
                        <SelectItem value="preparation">تحضيرية</SelectItem>
                        <SelectItem value="execution">تنفيذية</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>حالة المهمة</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر حالة المهمة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتملة</SelectItem>
                        <SelectItem value="cancelled">ملغاة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسؤول عن التنفيذ</FormLabel>
                    <FormControl>
                      <UserSelector 
                        value={field.value || "unassigned"} 
                        onChange={field.onChange}
                        meetingId={meetingId}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاريخ الاستحقاق</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الأولوية</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الأولوية" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="low">منخفضة</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="add_to_general_tasks"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">إضافة للمهام العامة</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requires_deliverable"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">تتطلب تسليم</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <AddTemplateButton templates={templates} setTemplates={setTemplates} />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإضافة..." : "إضافة المهمة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
