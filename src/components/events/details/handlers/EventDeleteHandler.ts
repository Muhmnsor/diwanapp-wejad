
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteHandlerProps {
  id: string;
  onSuccess: () => void;
}

// دالة مساعدة للحذف على دفعات
async function deleteInBatches(tableName: string, columnName: string, eventId: string, batchSize: number = 100) {
  let hasMore = true;
  let deletedCount = 0;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq(columnName, eventId)
      .limit(batchSize);

    if (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      throw error;
    }

    // التعامل مع القيم التي قد تكون null بشكل آمن
    if (!data) {
      hasMore = false;
      continue;
    }

    deletedCount += data.length;
    hasMore = data.length === batchSize;
  }

  return deletedCount;
}

// التحقق من عدد السجلات المرتبطة
async function getRelatedRecordsCount(eventId: string) {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('is_project_activity')
    .eq('id', eventId)
    .single();

  if (eventError) throw eventError;

  // التأكد من أن الفعالية ليست نشاطاً في مشروع
  if (event?.is_project_activity) {
    throw new Error('لا يمكن حذف نشاط مرتبط بمشروع بشكل مباشر');
  }

  const counts = await Promise.all([
    supabase.from('registrations').select('id', { count: 'exact' }).eq('event_id', eventId),
    supabase.from('event_feedback').select('id', { count: 'exact' }).eq('event_id', eventId),
    supabase.from('attendance_records').select('id', { count: 'exact' }).eq('event_id', eventId),
  ]);

  return {
    registrations: counts[0].count || 0,
    feedback: counts[1].count || 0,
    attendance: counts[2].count || 0,
  };
}

export const handleEventDelete = async ({ id, onSuccess }: DeleteHandlerProps) => {
  const loadingToast = toast.loading('جاري التحقق من البيانات...');
  
  try {
    console.log('Starting deletion process for event:', id);
    
    // التحقق من عدد السجلات المرتبطة
    const recordsCounts = await getRelatedRecordsCount(id);
    console.log('Related records count:', recordsCounts);
    
    // تحديث رسالة التحميل
    toast.dismiss(loadingToast);
    toast.loading('جاري حذف البيانات المرتبطة...');

    // 1. حذف التقييمات على دفعات
    console.log('Deleting feedback...');
    await deleteInBatches('event_feedback', 'event_id', id);
    console.log('Feedback deleted successfully');

    // 2. حذف سجلات الحضور على دفعات
    console.log('Deleting attendance records...');
    await deleteInBatches('attendance_records', 'event_id', id);
    console.log('Attendance records deleted successfully');

    // 3. حذف الإشعارات على دفعات
    console.log('Deleting notifications...');
    await deleteInBatches('notification_logs', 'event_id', id);
    console.log('Notifications deleted successfully');

    // 4. حذف التقارير
    console.log('Deleting reports...');
    const { error: reportsError } = await supabase
      .from('event_reports')
      .delete()
      .eq('event_id', id);

    if (reportsError) throw reportsError;
    console.log('Reports deleted successfully');

    // 5. حذف التسجيلات على دفعات
    console.log('Deleting registrations...');
    await deleteInBatches('registrations', 'event_id', id);
    console.log('Registrations deleted successfully');

    // 6. حذف إعدادات الإشعارات
    console.log('Deleting notification settings...');
    const { error: settingsError } = await supabase
      .from('event_notification_settings')
      .delete()
      .eq('event_id', id);

    if (settingsError) throw settingsError;
    console.log('Notification settings deleted successfully');

    // 7. حذف حقول التسجيل
    console.log('Deleting registration fields...');
    const { error: fieldsError } = await supabase
      .from('event_registration_fields')
      .delete()
      .eq('event_id', id);

    if (fieldsError) throw fieldsError;
    console.log('Registration fields deleted successfully');

    // 8. أخيراً حذف الفعالية نفسها
    console.log('Deleting event...');
    const { error: eventError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (eventError) throw eventError;

    console.log('Event deleted successfully');
    toast.dismiss();
    toast.success("تم حذف الفعالية بنجاح");
    onSuccess();
  } catch (error) {
    console.error('Error in deletion process:', error);
    toast.dismiss();
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("حدث خطأ أثناء حذف الفعالية");
    }
    throw error;
  }
};
