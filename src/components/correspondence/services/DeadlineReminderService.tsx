import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { differenceInDays, parseISO, format } from "date-fns";
import { ar } from "date-fns/locale";
// حذف استيراد useAuth
// import { useAuth } from "@supabase/auth-helpers-react";

export const DeadlineReminderService = () => {
  const { toast } = useToast();
  // استبدال useAuth بالحصول على المستخدم مباشرة من supabase
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // وظيفة للحصول على المستخدم الحالي
  const fetchCurrentUser = async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.user || null;
  };

  // فحص المواعيد النهائية المقتربة ومعالجتها
  const checkDeadlines = async () => {
    try {
      const currentUser = await fetchCurrentUser();
      if (!currentUser?.id) return;

      // جلب المعاملات التي لديها مواعيد نهائية وليست مؤرشفة أو مكتملة
      const { data: correspondences, error } = await supabase
        .from('correspondence')
        .select(`
          id,
          number,
          subject,
          deadline_date,
          status,
          assigned_to
        `)
        .not('status', 'in', '["مؤرشف","مكتمل"]')
        .not('deadline_date', 'is', null);

      if (error) throw error;

      const now = new Date();
      const notificationsToCreate = [];

      // مراجعة كل معاملة لديها موعد نهائي
      for (const corr of correspondences || []) {
        if (!corr.deadline_date) continue;

        const deadlineDate = parseISO(corr.deadline_date);
        const daysRemaining = differenceInDays(deadlineDate, now);

        // إنشاء تنبيهات للمواعيد النهائية (قبل 3 أيام، قبل يوم، تجاوز الموعد)
        if (daysRemaining <= 3 && daysRemaining >= 0) {
          // التحقق من عدم وجود تنبيه مماثل بالفعل
          const { data: existingNotifications } = await supabase
            .from('in_app_notifications')
            .select('id')
            .eq('related_entity_id', corr.id)
            .eq('notification_type', 'deadline_reminder')
            .eq('additional_data', daysRemaining.toString())
            .limit(1);

          if (existingNotifications && existingNotifications.length === 0) {
            // إنشاء تنبيه جديد
            const deadlineText = daysRemaining === 0
              ? 'اليوم'
              : daysRemaining === 1
                ? 'غداً'
                : `بعد ${daysRemaining} أيام`;

            notificationsToCreate.push({
              title: `تذكير: موعد نهائي للمعاملة #${corr.number}`,
              message: `الموعد النهائي للمعاملة "${corr.subject}" هو ${deadlineText} (${format(deadlineDate, 'dd MMMM', { locale: ar })})`,
              related_entity_id: corr.id,
              related_entity_type: 'correspondence',
              notification_type: 'deadline_reminder',
              user_id: corr.assigned_to || currentUser.id,
              additional_data: daysRemaining.toString(),
              read: false
            });
          }
        } else if (daysRemaining < 0) {
          // تنبيه تجاوز الموعد النهائي
          const overdueKey = `overdue_${Math.min(Math.abs(daysRemaining), 30)}`;

          const { data: existingNotifications } = await supabase
            .from('in_app_notifications')
            .select('id')
            .eq('related_entity_id', corr.id)
            .eq('notification_type', 'deadline_overdue')
            .eq('additional_data', overdueKey)
            .limit(1);

          if (existingNotifications && existingNotifications.length === 0) {
            const daysOverdue = Math.abs(daysRemaining);
            const overdueText = daysOverdue === 1
              ? 'يوم واحد'
              : `${daysOverdue} أيام`;

            notificationsToCreate.push({
              title: `تجاوز الموعد النهائي للمعاملة #${corr.number}`,
              message: `تم تجاوز الموعد النهائي للمعاملة "${corr.subject}" بـ ${overdueText}`,
              related_entity_id: corr.id,
              related_entity_type: 'correspondence',
              notification_type: 'deadline_overdue',
              user_id: corr.assigned_to || currentUser.id,
              additional_data: overdueKey,
              priority: 'high',
              read: false
            });
          }
        }
      }

      // إرسال الإشعارات دفعة واحدة
      if (notificationsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('in_app_notifications')
          .insert(notificationsToCreate);
        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error("Error checking deadlines:", error);
    }
  };

  useEffect(() => {
    const initUser = async () => {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);

      if (currentUser && !initialized) {
        setInitialized(true);

        // فحص المواعيد النهائية عند تحميل المكون
        checkDeadlines();

        // فحص دوري للمواعيد النهائية كل ساعة
        const timer = setInterval(checkDeadlines, 60 * 60 * 1000);

        return () => clearInterval(timer);
      }
    };

    initUser();
  }, [initialized]);

  // هذا المكون غير مرئي، فقط للمنطق البرمجي
  return null;
};

export default DeadlineReminderService;
