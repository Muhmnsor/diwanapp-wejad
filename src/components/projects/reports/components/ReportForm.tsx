import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { ReportFormFields } from "./form/ReportFormFields";

const formSchema = z.object({
  program_name: z.string().min(1, "الرجاء إدخال اسم البرنامج"),
  report_name: z.string().min(1, "الرجاء إدخال اسم التقرير"),
  report_text: z.string().min(1, "الرجاء إدخال نص التقرير"),
  detailed_description: z.string().optional(),
  activity_duration: z.string().optional(),
  attendees_count: z.string().optional(),
  activity_objectives: z.string().optional(),
  impact_on_participants: z.string().optional(),
  photos: z.array(z.object({
    url: z.string(),
    description: z.string()
  })).optional(),
});

interface ReportFormProps {
  projectId: string;
  activityId: string;
  onSuccess?: () => void;
  initialData?: ProjectActivityReport;
}

export const ReportForm = ({
  projectId,
  activityId,
  onSuccess,
  initialData,
}: ReportFormProps) => {
  console.log("ReportForm - initialData:", initialData);
  
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      program_name: initialData?.program_name || "",
      report_name: initialData?.report_name || "",
      report_text: initialData?.report_text || "",
      detailed_description: initialData?.detailed_description || "",
      activity_duration: initialData?.activity_duration || "",
      attendees_count: initialData?.attendees_count || "",
      activity_objectives: initialData?.activity_objectives || "",
      impact_on_participants: initialData?.impact_on_participants || "",
      photos: initialData?.photos || [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
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

      const { error } = await operation;

      if (error) throw error;

      toast.success(initialData ? "تم تحديث التقرير بنجاح" : "تم إنشاء التقرير بنجاح");
      await queryClient.invalidateQueries({
        queryKey: ["project-activity-reports", projectId],
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error("حدث خطأ أثناء حفظ التقرير");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ReportFormFields form={form} />
        <Button type="submit">
          {initialData ? "تحديث التقرير" : "إنشاء التقرير"}
        </Button>
      </form>
    </Form>
  );
};