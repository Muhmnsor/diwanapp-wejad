import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
}

export const ProjectActivityReportForm = ({
  projectId,
  activityId,
  onSuccess,
}: ProjectActivityReportFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

      const { error } = await supabase.from("project_activity_reports").insert({
        ...values,
        project_id: projectId,
        activity_id: activityId,
        executor_id: user.id, // Add executor_id
      });

      if (error) throw error;

      toast.success("تم إنشاء التقرير بنجاح");
      await queryClient.invalidateQueries({
        queryKey: ["project-activity-reports", projectId],
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating report:", error);
      toast.error("حدث خطأ أثناء إنشاء التقرير");
    }
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register("program_name")} placeholder="اسم البرنامج" />
      <Input {...form.register("report_name")} placeholder="اسم التقرير" />
      <Textarea {...form.register("report_text")} placeholder="نص التقرير" />
      <Textarea {...form.register("detailed_description")} placeholder="التفاصيل" />
      <Input {...form.register("activity_duration")} placeholder="مدة النشاط" />
      <Input {...form.register("attendees_count")} placeholder="عدد المشاركين" />
      <Input {...form.register("activity_objectives")} placeholder="الأهداف" />
      <Input {...form.register("impact_on_participants")} placeholder="الأثر على المشاركين" />
      <Button type="submit">إنشاء التقرير</Button>
    </Form>
  );
};
