
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { TaskType } from "@/types/meeting";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

type TaskFormValues = {
  title: string;
  description?: string;
  due_date?: string;
  assigned_to?: string;
  task_type: TaskType;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  add_to_general_tasks?: boolean;
};

export const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess,
}) => {
  const { mutateAsync: createTask, isPending } = useCreateMeetingTask();

  const form = useForm<TaskFormValues>({
    defaultValues: {
      title: "",
      description: "",
      task_type: "action_item",
      status: "pending",
      add_to_general_tasks: false,
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    try {
      await createTask({
        meeting_id: meetingId,
        title: values.title,
        description: values.description,
        due_date: values.due_date,
        assigned_to: values.assigned_to,
        task_type: values.task_type,
        status: values.status,
        add_to_general_tasks: values.add_to_general_tasks,
      });
      
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مهمة جديدة</DialogTitle>
          <DialogDescription className="text-right">
            أضف مهمة جديدة مرتبطة بهذا الاجتماع
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="text-right">
                  <FormLabel>عنوان المهمة</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-right" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="text-right">
                  <FormLabel>وصف المهمة</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px] text-right"
                    />
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
                  <FormItem className="text-right">
                    <FormLabel>نوع المهمة</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
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
                  <FormItem className="text-right">
                    <FormLabel>الحالة</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
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
                name="due_date"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>تاريخ الاستحقاق</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="text-right"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>المسؤول</FormLabel>
                    <FormControl>
                      <Input {...field} className="text-right" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6 flex flex-row-reverse justify-start gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإضافة..." : "إضافة المهمة"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
