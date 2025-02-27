
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

  useEffect(() => {
    // تحديث الحالة المعروضة كلما تغيرت الحالة الأصلية
    setDisplayStatus(status);
  }, [status]);

  useEffect(() => {
    // فحص ما إذا كان الوقت قد انتهى وكان يجب تغيير الحالة
    const checkTimeExpired = async () => {
      // تجنب التنفيذ إذا كان التحديث قيد التنفيذ بالفعل
      if (isUpdating || !ideaId) return;

      try {
        // سجلات تصحيح مفصلة
        console.log("StatusBadge - بداية فحص الحالة للفكرة", ideaId);
        console.log("الحالة الحالية:", status);
        console.log("فترة المناقشة:", discussion_period);
        console.log("تاريخ الإنشاء:", created_at);

        // التحقق من الشروط الأساسية
        if (!discussion_period || !created_at) {
          console.log("لا توجد فترة مناقشة أو تاريخ إنشاء");
          return;
        }

        // تنفيذ الفحص فقط إذا كانت الحالة هي "قيد المناقشة"
        if (status.toLowerCase() !== "under_review") {
          console.log("الحالة ليست قيد المناقشة، الحالة الحالية:", status);
          return;
        }

        // التحقق من الوقت المتبقي
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        console.log("الوقت المتبقي للمناقشة:", timeLeft);

        // إذا انتهى وقت المناقشة ولا يزال في حالة قيد المناقشة
        if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
          console.log("⚠️ انتهى وقت المناقشة. التحقق من وجود قرار...");
          
          setIsUpdating(true);

          // التحقق من وجود قرار للفكرة
          const { data: decisionData, error: decisionError } = await supabase
            .from("idea_decisions")
            .select("id")
            .eq("idea_id", ideaId)
            .maybeSingle();

          if (decisionError) {
            console.error("خطأ في التحقق من وجود قرار:", decisionError);
            setIsUpdating(false);
            return;
          }

          // إذا لم يوجد قرار، نغير الحالة إلى "بانتظار القرار"
          if (!decisionData) {
            console.log("لا يوجد قرار للفكرة. تغيير الحالة إلى بانتظار القرار...");

            // جلب بيانات الفكرة الحالية للتأكد
            const { data: ideaData, error: ideaError } = await supabase
              .from("ideas")
              .select("status")
              .eq("id", ideaId)
              .single();

            if (ideaError) {
              console.error("خطأ في جلب حالة الفكرة:", ideaError);
              setIsUpdating(false);
              return;
            }

            // تحديث الحالة فقط إذا كانت لا تزال في حالة "قيد المناقشة"
            if (ideaData && ideaData.status === "under_review") {
              console.log("تأكيد أن الفكرة لا تزال قيد المناقشة. بدء التحديث...");
              
              const { error: updateError } = await supabase
                .from("ideas")
                .update({ status: "pending_decision" })
                .eq("id", ideaId);

              if (updateError) {
                console.error("خطأ في تحديث حالة الفكرة:", updateError);
                setIsUpdating(false);
                return;
              }

              console.log("✅ تم تحديث حالة الفكرة بنجاح إلى بانتظار القرار");
              
              // تحديث الحالة المعروضة مباشرة بدون انتظار استجابة API
              setDisplayStatus("pending_decision");
              
              // إشعار المستخدم
              toast.info("انتهت فترة المناقشة. الفكرة الآن بانتظار القرار.", {
                duration: 5000
              });
              
              // إعادة تحميل الصفحة بعد ثانيتين لضمان تحديث جميع المكونات
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              console.log("الفكرة ليست في حالة قيد المناقشة:", ideaData?.status);
            }
          } else {
            console.log("يوجد قرار بالفعل للفكرة. لا حاجة للتحديث.");
          }
          
          setIsUpdating(false);
        }
      } catch (error) {
        console.error("خطأ غير متوقع أثناء فحص حالة الفكرة:", error);
        setIsUpdating(false);
      }
    };

    // تنفيذ الفحص
    checkTimeExpired();
    
    // تعيين مؤقت لإعادة الفحص كل 10 ثواني
    const timer = setInterval(checkTimeExpired, 10000);

    // تنظيف المؤقت عند إزالة المكون
    return () => clearInterval(timer);
  }, [status, created_at, discussion_period, ideaId, isUpdating]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
