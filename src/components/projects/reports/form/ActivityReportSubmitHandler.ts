import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectActivityReport } from "@/types/projectActivityReport";

export const handleActivityReportSubmit = async ({
  values,
  projectId,
  activityId,
  initialData,
  user,
  queryClient,
  onSuccess,
}: {
  values: any;
  projectId: string;
  activityId: string;
  initialData?: ProjectActivityReport;
  user: { id: string } | null;
  queryClient: any;
  onSuccess?: () => void;
}) => {
  console.log("Submitting project activity report:", { values, projectId, activityId });

  if (!user) {
    toast.error("يجب تسجيل الدخول لإنشاء تقرير");
    return false;
  }

  try {
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
      return false;
    }

    console.log("Report saved successfully:", data);
    
    await queryClient.invalidateQueries({
      queryKey: ["project-activity-reports", projectId],
    });

    toast.success(initialData ? "تم تحديث التقرير بنجاح" : "تم إنشاء التقرير بنجاح");
    
    if (onSuccess) {
      onSuccess();
    }

    return true;
  } catch (error) {
    console.error("Error saving report:", error);
    toast.error("حدث خطأ أثناء حفظ التقرير");
    return false;
  }
};