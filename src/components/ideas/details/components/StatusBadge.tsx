
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StatusBadgeProps {
  status: string;
  created_at?: string;
  discussion_period?: string;
  ideaId?: string;
}

export const StatusBadge = ({ status, created_at, discussion_period, ideaId }: StatusBadgeProps) => {
  const [currentStatus, setCurrentStatus] = useState(status);

  // جلب الحالة الحالية من قاعدة البيانات مباشرة
  useEffect(() => {
    if (!ideaId) return;

    const fetchCurrentStatus = async () => {
      try {
        // جلب الحالة الحالية من قاعدة البيانات
        const { data, error } = await supabase
          .from("ideas")
          .select("status")
          .eq("id", ideaId)
          .single();

        if (error) {
          console.error("خطأ في جلب حالة الفكرة:", error);
          return;
        }

        if (data && data.status !== currentStatus) {
          console.log(`تحديث الحالة من ${currentStatus} إلى ${data.status}`);
          setCurrentStatus(data.status);
        }
      } catch (error) {
        console.error("خطأ غير متوقع:", error);
      }
    };

    fetchCurrentStatus();

    // تحديث كل 5 ثواني للتأكد من أحدث حالة
    const intervalId = setInterval(fetchCurrentStatus, 5000);
    return () => clearInterval(intervalId);
  }, [ideaId, currentStatus]);

  // فحص ما إذا كان يجب تحديث الحالة بناءً على انتهاء المناقشة
  useEffect(() => {
    if (!ideaId || !created_at || !discussion_period) return;
    if (currentStatus !== "under_review") return; // فقط للأفكار قيد المناقشة

    const checkAndUpdateStatus = async () => {
      try {
        // حساب ما إذا كانت المناقشة قد انتهت
        const discussionEndDate = calculateDiscussionEndDate(created_at, discussion_period);
        const now = new Date();
        
        // إذا انتهى وقت المناقشة
        if (discussionEndDate <= now) {
          console.log("انتهت مدة المناقشة. الحالة الحالية:", currentStatus);
          
          // التحقق من وجود قرار
          const { data: decisionExists } = await supabase
            .from("idea_decisions")
            .select("id")
            .eq("idea_id", ideaId)
            .maybeSingle();
            
          // إذا لم يوجد قرار، نقوم بتحديث الحالة
          if (!decisionExists) {
            console.log("لا يوجد قرار. تحديث الحالة إلى 'بانتظار القرار'");
            
            const { error: updateError } = await supabase
              .from("ideas")
              .update({ status: "pending_decision" })
              .eq("id", ideaId);
              
            if (updateError) {
              console.error("خطأ في تحديث حالة الفكرة:", updateError);
              return;
            }
            
            setCurrentStatus("pending_decision");
            toast.info("انتهت فترة المناقشة. الفكرة الآن بانتظار القرار.");
          }
        }
      } catch (error) {
        console.error("خطأ في فحص وتحديث الحالة:", error);
      }
    };
    
    checkAndUpdateStatus();
    
    // تحقق دوري
    const intervalId = setInterval(checkAndUpdateStatus, 10000);
    return () => clearInterval(intervalId);
  }, [ideaId, created_at, discussion_period, currentStatus]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(currentStatus)}`}>
      {getStatusDisplay(currentStatus)}
    </span>
  );
};

// دالة مساعدة لحساب تاريخ انتهاء المناقشة
function calculateDiscussionEndDate(created_at: string, discussion_period: string): Date {
  try {
    const createdDate = new Date(created_at);
    let hoursToAdd = 0;
    
    // معالجة صيغة "X days Y hours"
    if (discussion_period.includes('days') || discussion_period.includes('day') || 
        discussion_period.includes('hours') || discussion_period.includes('hour')) {
      
      const parts = discussion_period.split(' ');
      
      for (let i = 0; i < parts.length; i++) {
        if ((parts[i] === 'days' || parts[i] === 'day') && i > 0) {
          const days = parseInt(parts[i-1]);
          if (!isNaN(days)) {
            hoursToAdd += days * 24;
          }
        }
        if ((parts[i] === 'hours' || parts[i] === 'hour') && i > 0) {
          const hours = parseInt(parts[i-1]);
          if (!isNaN(hours)) {
            hoursToAdd += hours;
          }
        }
      }
    } 
    // معالجة صيغة "HH:MM:SS"
    else if (discussion_period.includes(':')) {
      const timeParts = discussion_period.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        
        if (!isNaN(hours)) {
          hoursToAdd += hours;
        }
        
        if (!isNaN(minutes)) {
          hoursToAdd += minutes / 60;
        }
      }
    }
    // محاولة تفسير القيمة كرقم (عدد الساعات)
    else {
      const hours = parseFloat(discussion_period);
      if (!isNaN(hours)) {
        hoursToAdd = hours;
      }
    }
    
    // إضافة الساعات إلى تاريخ الإنشاء
    return new Date(createdDate.getTime() + (hoursToAdd * 60 * 60 * 1000));
  } catch (error) {
    console.error("خطأ في حساب تاريخ انتهاء المناقشة:", error);
    // إرجاع تاريخ سابق في حالة الخطأ - هذا سيؤدي إلى اعتبار المناقشة منتهية
    return new Date(0);
  }
}
