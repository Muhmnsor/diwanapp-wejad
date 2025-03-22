
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { ProjectMember } from "./types/projectMember";

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "عنوان المهمة مطلوب" }),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().min(1, { message: "أولوية المهمة مطلوبة" }),
  stageId: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
  category: z.string().optional(),
  requiresDeliverable: z.boolean().optional()
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export interface TaskFormProps {
  onSubmit: (formData: TaskFormValues) => Promise<void>;
  isSubmitting: boolean;
  projectStages: { id: string; name: string }[];
  projectMembers: ProjectMember[];
  isGeneral?: boolean;
  meetingId?: string; // Add meetingId prop
  initialValues?: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    category?: string;
    requiresDeliverable?: boolean;
  };
}

export const TaskForm = ({
  onSubmit,
  isSubmitting,
  projectStages,
  projectMembers,
  isGeneral = false,
  meetingId, // Use meetingId prop
  initialValues
}: TaskFormProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialValues || {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      stageId: projectStages.length > 0 ? projectStages[0].id : "",
      assignedTo: null,
      category: "",
      requiresDeliverable: false
    }
  });

  const handleFormSubmit = async (data: TaskFormValues) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Error submitting task form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان المهمة*</FormLabel>
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
            <FormItem>
              <FormLabel>وصف المهمة</FormLabel>
              <FormControl>
                <Textarea placeholder="أدخل وصفًا للمهمة" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
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

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الأولوية*</FormLabel>
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
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isGeneral && !meetingId && projectStages.length > 0 && (
          <FormField
            control={form.control}
            name="stageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>مرحلة المهمة*</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مرحلة المهمة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projectStages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isGeneral && (
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تصنيف المهمة</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تصنيف المهمة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="administrative">إدارية</SelectItem>
                    <SelectItem value="technical">تقنية</SelectItem>
                    <SelectItem value="logistics">لوجستية</SelectItem>
                    <SelectItem value="financial">مالية</SelectItem>
                    <SelectItem value="marketing">تسويقية</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المسؤول عن التنفيذ</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المسؤول عن التنفيذ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">بدون تعيين</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name || member.email}
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
          name="requiresDeliverable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-reverse space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>يتطلب تسليم ملف</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2 space-x-2 space-x-reverse rtl">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ المهمة'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
