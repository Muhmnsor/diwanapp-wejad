import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const deleteProject = async (projectId: string) => {
  try {
    console.log('Starting project deletion process for:', projectId);

    // 1. جلب معرفات الأنشطة أولاً
    const { data: activities, error: fetchError } = await supabase
      .from('project_activities')
      .select('id')
      .eq('project_id', projectId);

    if (fetchError) throw fetchError;

    if (activities && activities.length > 0) {
      const activityIds = activities.map(activity => activity.id);

      // 2. حذف سجلات الحضور
      const { error: attendanceError } = await supabase
        .from("activity_attendance")
        .delete()
        .in('activity_id', activityIds);

      if (attendanceError) throw attendanceError;

      // 3. حذف التقييمات
      const { error: feedbackError } = await supabase
        .from("activity_feedback")
        .delete()
        .in('activity_id', activityIds);

      if (feedbackError) throw feedbackError;

      // 4. حذف الأنشطة
      const { error: activitiesError } = await supabase
        .from("project_activities")
        .delete()
        .eq('project_id', projectId);

      if (activitiesError) throw activitiesError;
    }

    // 5. حذف التسجيلات
    const { error: registrationsError } = await supabase
      .from("registrations")
      .delete()
      .eq('project_id', projectId);

    if (registrationsError) throw registrationsError;

    // 6. حذف الشهادات
    const { error: certificatesError } = await supabase
      .from("certificates")
      .delete()
      .eq('project_id', projectId);

    if (certificatesError) throw certificatesError;

    // 7. حذف المشروع نفسه
    const { error: projectError } = await supabase
      .from("projects")
      .delete()
      .eq('id', projectId);

    if (projectError) throw projectError;

    console.log('Project deletion completed successfully');
    toast.success('تم حذف المشروع بنجاح');
  } catch (error) {
    console.error('Error in deleteProject:', error);
    toast.error('حدث خطأ أثناء حذف المشروع');
    throw error;
  }
};

