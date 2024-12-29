import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectDeletionHandlerProps {
  projectId: string;
  onSuccess: () => void;
}

export const handleProjectDeletion = async ({ projectId, onSuccess }: ProjectDeletionHandlerProps) => {
  try {
    console.log('بدء عملية حذف المشروع:', projectId);

    // 1. حذف التسجيلات المرتبطة بالمشروع
    const { error: registrationsError } = await supabase
      .from('registrations')
      .delete()
      .eq('project_id', projectId);

    if (registrationsError) {
      console.error('خطأ في حذف التسجيلات:', registrationsError);
      throw registrationsError;
    }
    console.log('تم حذف التسجيلات بنجاح');

    // 2. حذف ارتباطات المشروع بالفعاليات
    const { error: projectEventsError } = await supabase
      .from('project_events')
      .delete()
      .eq('project_id', projectId);

    if (projectEventsError) {
      console.error('خطأ في حذف ارتباطات المشروع:', projectEventsError);
      throw projectEventsError;
    }
    console.log('تم حذف ارتباطات المشروع بنجاح');

    // 3. حذف المشروع نفسه
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (projectError) {
      console.error('خطأ في حذف المشروع:', projectError);
      throw projectError;
    }

    console.log('تم حذف المشروع بنجاح');
    toast.success("تم حذف المشروع بنجاح");
    onSuccess();
  } catch (error) {
    console.error('خطأ في عملية الحذف:', error);
    toast.error("حدث خطأ أثناء حذف المشروع");
    throw error;
  }
};