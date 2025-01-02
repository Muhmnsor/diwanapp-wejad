import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectActivityReport } from "@/types/projectActivityReport";

const formSchema = z.object({
  program_name: z.string().min(1, "الرجاء إدخال اسم البرنامج"),
  report_name: z.string().min(1, "الرجاء إدخال اسم التقرير"),
  report_text: z.string().min(1, "الرجاء إدخال نص التقرير"),
  detailed_description: z.string().optional(),
  activity_duration: z.string().optional(),
  attendees_count: z.string().optional(),
  activity_objectives: z.string().optional(),
  impact_on_participants: z.string().optional(),
  photos: z.array(z.any()).optional(),
});

interface ProjectActivityReportFormProps {
  projectId: string;
  activityId: string;
  onSuccess?: () => void;
  initialData?: ProjectActivityReport;
}

export const ProjectActivityReportForm = ({
  projectId,
  activityId,
  onSuccess,
  initialData,
}: ProjectActivityReportFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      program_name: "",
      report_name: "",
      report_text: "",
      detailed_description: "",
      activity_duration: "",
      attendees_count: "",
      activity_objectives: "",
      impact_on_participants: "",
      photos: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("Submitting project activity report:", { values, projectId, activityId });
      
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("يجب تسجيل الدخول لإنشاء تقرير");
        return;
      }

      const operation = initialData 
        ? supabase
            .from("project_activity_reports")
            .update(values)
            .eq("id", initialData.id)
        : supabase
            .from("project_activity_reports")
            .insert({
              ...values,
              project_id: projectId,
              activity_id: activityId,
              executor_id: user.id,
            });

      const { error, data } = await operation;

      if (error) {
        console.error("Error saving report:", error);
        toast.error("حدث خطأ أثناء حفظ التقرير");
        return;
      }

      console.log("Report saved successfully:", data);
      
      await queryClient.invalidateQueries({
        queryKey: ["project-activity-reports", projectId],
      });

      toast.success(initialData ? "تم تحديث التقرير بنجاح" : "تم إنشاء التقرير بنجاح");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("حدث خطأ أثناء حفظ التقرير");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="program_name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="اسم البرنامج" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="report_name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="اسم التقرير" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="report_text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="نص التقرير" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="detailed_description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="التفاصيل" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="activity_duration"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="مدة النشاط" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attendees_count"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="عدد المشاركين" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="activity_objectives"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="الأهداف" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="impact_on_participants"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="الأثر على المشاركين" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting 
            ? "جاري الحفظ..." 
            : initialData 
              ? "تحديث التقرير" 
              : "إنشاء التقرير"
          }
        </Button>
      </form>
    </Form>
  );
};