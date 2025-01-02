import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { ActivityReportFormFields } from "./form/ActivityReportFormFields";
import { handleActivityReportSubmit } from "./form/ActivityReportSubmitHandler";

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
    const { data: { user } } = await supabase.auth.getUser();
    
    const success = await handleActivityReportSubmit({
      values,
      projectId,
      activityId,
      initialData,
      user,
      queryClient,
      onSuccess,
    });

    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ActivityReportFormFields form={form} />
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