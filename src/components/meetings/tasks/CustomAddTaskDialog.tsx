
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskType, TaskStatus } from "@/types/meeting";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CustomAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "عنوان المهمة مطلوب ويجب أن يحتوي على الأقل 3 أحرف" }),
  description: z.string().optional(),
  task_type: z.enum(["action_item", "follow_up", "decision", "preparation", "execution", "other"]),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  due_date: z.date().optional().nullable(),
  assigned_to: z.string().optional(),
  add_to_general_tasks: z.boolean().default(false),
  requires_deliverable: z.boolean().default(false),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

type FormValues = z.infer<typeof formSchema>;

export const CustomAddTaskDialog: React.FC<CustomAddTaskDialogProps> = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess
}) => {
  const { mutate: createTask, isLoading } = useCreateMeetingTask();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      task_type: "action_item" as TaskType,
      status: "pending" as TaskStatus,
      due_date: null,
      assigned_to: "",
      add_to_general_tasks: false,
      requires_deliverable: false,
      priority: "medium",
    }
  });

  const handleSubmit = (values: FormValues) => {
    createTask({
      meeting_id: meetingId,
      title: values.title,
      description: values.description,
      task_type: values.task_type,
      status: values.status,
      due_date: values.due_date ? format(values.due_date, 'yyyy-MM-dd') : undefined,
      assigned_to: values.assigned_to || undefined,
      add_to_general_tasks: values.add_to_general_tasks,
      requires_deliverable: values.requires_deliverable,
      priority: values.priority,
    }, {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="text-right">
                  <FormLabel>عنوان المهمة *</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان المهمة" {...field} />
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
                      placeholder="أدخل وصفاً تفصيلياً للمهمة"
                      className="min-h-[100px]" 
                      {...field} 
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
                  <FormItem className="text-right">
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
                name="due_date"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>تاريخ الاستحقاق</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: ar })
                            ) : (
                              <span>اختر تاريخ</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          locale={ar}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="text-right">
                    <FormLabel>الأولوية</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر أولوية المهمة" />
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
            </div>

            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem className="text-right">
                  <FormLabel>المكلف بالمهمة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل اسم الشخص المكلف بالمهمة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requires_deliverable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      تتطلب مستلمات إلزامية
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="add_to_general_tasks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      إضافة إلى المهام العامة
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? "جاري الإضافة..." : "إضافة المهمة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
