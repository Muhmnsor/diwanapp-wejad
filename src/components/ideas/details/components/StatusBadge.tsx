
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
import { useEffect, useState } from "react";
import { calculateTimeRemaining } from "../utils/countdownUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StatusBadgeProps {
  status: string;
  created_at?: string;
  discussion_period?: string;
  ideaId?: string;
}

export const StatusBadge = ({ status, created_at, discussion_period, ideaId }: StatusBadgeProps) => {
  const [displayStatus, setDisplayStatus] = useState(status);
  const [isUpdating, setIsUpdating] = useState(false);

  // تحقق من انتهاء وقت المناقشة عند تحميل المكون أو تغيير الحالة
  useEffect(() => {
    const checkDiscussionEnded = async () => {
      try {
        // التحقق من الشروط الأساسية
        if (!discussion_period || !created_at || !ideaId) {
          return;
        }

        // حساب الوقت المتبقي للمناقشة
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        console.log("StatusBadge - الوقت المتبقي:", timeLeft, "الحالة الحالية:", status);

        // إذا كانت الحالة الحالية هي قيد المناقشة (under_review) وانتهى الوقت
        if (status === "under_review" && 
            timeLeft.days === 0 && timeLeft.hours === 0 && 
            timeLeft.minutes === 0 && timeLeft.seconds === 0) {
          
          console.log("المناقشة انتهت والحالة الحالية هي قيد المناقشة، يجب تحديثها");
          
          // التحقق من وجود قرار للفكرة قبل تحديث الحالة
          const { data: decisionData, error: decisionError } = await supabase
            .from("idea_decisions")
            .select("id")
            .eq("idea_id", ideaId)
            .maybeSingle();
          
          if (decisionError) {
            console.error("خطأ في التحقق من وجود قرار:", decisionError);
            return;
          }
          
          // إذا لم يوجد قرار، تحديث الحالة إلى بانتظار القرار
          if (!decisionData) {
            console.log("لا يوجد قرار، تحديث الحالة إلى بانتظار القرار");
            setDisplayStatus("pending_decision");
            
            // تحديث الحالة في قاعدة البيانات
            if (!isUpdating) {
              setIsUpdating(true);
              const { error: updateError } = await supabase
                .from("ideas")
                .update({ status: "pending_decision" })
                .eq("id", ideaId);
              
              setIsUpdating(false);
              
              if (updateError) {
                console.error("خطأ في تحديث حالة الفكرة:", updateError);
                return;
              }
              
              console.log("✅ تم تحديث حالة الفكرة بنجاح إلى بانتظار القرار");
              toast.info("انتهت فترة المناقشة. الفكرة الآن بانتظار القرار.", {
                duration: 5000
              });
              
              // إعادة تحميل الصفحة لتحديث جميع المكونات
              setTimeout(() => window.location.reload(), 1500);
            }
          }
        } else if (timeLeft.days === 0 && timeLeft.hours === 0 && 
                  timeLeft.minutes === 0 && timeLeft.seconds === 0) {
          // إذا انتهى وقت المناقشة، استخدم الحالة المخزنة في قاعدة البيانات بدلاً من الحالة المرسلة كخاصية
          const { data: ideaData, error: ideaError } = await supabase
            .from("ideas")
            .select("status")
            .eq("id", ideaId)
            .single();
          
          if (ideaError) {
            console.error("خطأ في جلب حالة الفكرة من قاعدة البيانات:", ideaError);
            return;
          }
          
          if (ideaData) {
            console.log("تم جلب حالة الفكرة من قاعدة البيانات:", ideaData.status);
            setDisplayStatus(ideaData.status);
          }
        } else {
          // في حالة لم ينتهِ وقت المناقشة، استخدم الحالة المرسلة كخاصية
          setDisplayStatus(status);
        }
      } catch (error) {
        console.error("خطأ غير متوقع أثناء فحص حالة المناقشة:", error);
      }
    };

    checkDiscussionEnded();
  }, [status, created_at, discussion_period, ideaId, isUpdating]);

  // فحص دوري لحالة المناقشة
  useEffect(() => {
    // تنفيذ الفحص كل 10 ثواني
    const timer = setInterval(() => {
      if (!isUpdating && ideaId && created_at && discussion_period && status === "under_review") {
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        console.log("فحص دوري للوقت المتبقي:", timeLeft);
        
        if (timeLeft.days === 0 && timeLeft.hours === 0 && 
            timeLeft.minutes === 0 && timeLeft.seconds === 0) {
          console.log("انتهى وقت المناقشة في الفحص الدوري، تحديث الصفحة");
          window.location.reload();
        }
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [status, created_at, discussion_period, ideaId, isUpdating]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
