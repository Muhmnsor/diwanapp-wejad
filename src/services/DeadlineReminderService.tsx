// المسار: src/services/DeadlineReminderService.tsx

import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface DeadlineItem {
  id: string;
  correspondence_id: string;
  correspondence_number: string;
  correspondence_subject: string;
  deadline_date: string;
  days_remaining: number;
  status: string;
}

export const useDeadlineReminders = (userId: string) => {
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchDeadlines();
      
      // تحديث كل 5 دقائق
      const interval = setInterval(fetchDeadlines, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchDeadlines = async () => {
    setLoading(true);
    try {
      // جلب المواعيد النهائية للمستخدم
      const { data, error } = await supabase
        .from('correspondence_distribution')
        .select(`
          id,
          response_deadline,
          status,
          correspondence_id,
          correspondence:correspondence_id (number, subject)
        `)
        .eq('distributed_to', userId)
        .eq('status', 'pending')
        .not('response_deadline', 'is', null)
        .order('response_deadline', { ascending: true });

      if (error) throw error;
      
      // حساب الأيام المتبقية وتنسيق البيانات
      const currentDate = new Date();
      const formattedDeadlines: DeadlineItem[] = data
        .filter(item => item.response_deadline) // استبعاد null
        .map(item => {
          const deadlineDate = new Date(item.response_deadline);
          const diffTime = deadlineDate.getTime() - currentDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          return {
            id: item.id,
            correspondence_id: item.correspondence_id,
            correspondence_number: item.correspondence.number,
            correspondence_subject: item.correspondence.subject,
            deadline_date: item.response_deadline,
            days_remaining: diffDays,
            status: item.status
          };
        })
        .filter(item => item.days_remaining >= -1); // تضمين المتأخرة بيوم واحد وما بعده

      setDeadlines(formattedDeadlines);
      
      // عرض تنبيهات للمواعيد الوشيكة أو المتأخرة
      formattedDeadlines.forEach(deadline => {
        if (deadline.days_remaining <= 0) {
          // تنبيه للمواعيد المتأخرة
          createDeadlineNotification(deadline, true);
        } else if (deadline.days_remaining <= 2) {
          // تنبيه للمواعيد الوشيكة (أقل من يومين)
          createDeadlineNotification(deadline, false);
        }
      });
      
    } catch (err) {
      console.error('Error fetching deadlines:', err);
    } finally {
      setLoading(false);
    }
  };

  const createDeadlineNotification = async (deadline: DeadlineItem, isOverdue: boolean) => {
    // التحقق مما إذا كان التنبيه تم إنشاؤه بالفعل في آخر 6 ساعات
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    
    const { data: existingNotifications } = await supabase
      .from('in_app_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('related_entity_id', deadline.correspondence_id)
      .eq('notification_type', 'deadline')
      .gte('created_at', sixHoursAgo.toISOString());
    
    if (existingNotifications && existingNotifications.length > 0) {
      // تم إنشاء تنبيه مؤخرًا، لا داعي لإنشاء واحد جديد
      return;
    }
    
    // إنشاء تنبيه جديد
    try {
      const title = isOverdue 
        ? `موعد متأخر: ${deadline.correspondence_number}`
        : `موعد وشيك: ${deadline.correspondence_number}`;
        
      const message = isOverdue
        ? `المعاملة ${deadline.correspondence_number} متأخرة عن الموعد النهائي!`
        : `المعاملة ${deadline.correspondence_number} لديها موعد نهائي قريب (${deadline.days_remaining} أيام).`;
      
      await supabase
        .from('in_app_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          notification_type: 'deadline',
          related_entity_id: deadline.correspondence_id,
          related_entity_type: 'correspondence',
          deadline_date: deadline.deadline_date,
          read: false
        });
      
      // عرض toast تنبيه
      if (isOverdue) {
        toast({
          variant: "destructive",
          title: "معاملة متأخرة",
          description: message
        });
      } else {
        toast({
          variant: "warning",
          title: "موعد نهائي وشيك",
          description: message
        });
      }
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  };

  return { deadlines, loading, refreshDeadlines: fetchDeadlines };
};

