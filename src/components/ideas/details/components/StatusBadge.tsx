
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
import { useEffect, useState } from "react";
import { calculateTimeRemaining } from "../utils/countdownUtils";
import { supabase } from "@/integrations/supabase/client";

interface StatusBadgeProps {
  status: string;
  created_at?: string;
  discussion_period?: string;
  ideaId?: string;
}

export const StatusBadge = ({ status, created_at, discussion_period, ideaId }: StatusBadgeProps) => {
  const [displayStatus, setDisplayStatus] = useState(status);

  useEffect(() => {
    // فحص ما إذا كان الوقت قد انتهى وكان يجب تغيير الحالة
    const checkTimeExpired = async () => {
      console.log("الحالة الحالية:", status);
      console.log("فترة المناقشة:", discussion_period);
      console.log("تاريخ الإنشاء:", created_at);
      
      // تعيين الحالة المبدئية لتكون نفس الحالة المستلمة من الخارج
      let newStatus = status;
      
      if (discussion_period && created_at && status === "under_review") {
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        console.log("الوقت المتبقي:", timeLeft);
        
        // إذا كان الوقت قد انتهى والحالة لا تزال "قيد المناقشة"
        if (
          timeLeft.days === 0 && 
          timeLeft.hours === 0 && 
          timeLeft.minutes === 0 && 
          timeLeft.seconds === 0
        ) {
          console.log("الوقت انتهى، التحقق من وجود قرار");
          // التحقق من وجود قرار
          if (ideaId) {
            try {
              const { data: decisionData, error } = await supabase
                .from("idea_decisions")
                .select("id")
                .eq("idea_id", ideaId)
                .maybeSingle();
                
              console.log("بيانات القرار:", decisionData);
              console.log("خطأ الاستعلام:", error);
                
              if (!error && !decisionData) {
                console.log("لا يوجد قرار، تغيير الحالة إلى بانتظار القرار");
                // لم يتخذ قرار بعد، يجب أن تكون الحالة "بانتظار القرار"
                newStatus = "pending_decision";
                
                // تحديث حالة الفكرة في قاعدة البيانات
                const { error: updateError } = await supabase
                  .from("ideas")
                  .update({ status: "pending_decision" })
                  .eq("id", ideaId);
                  
                if (updateError) {
                  console.error("خطأ في تحديث حالة الفكرة:", updateError);
                } else {
                  console.log("تم تحديث حالة الفكرة بنجاح إلى بانتظار القرار");
                }
              } else if (decisionData) {
                console.log("يوجد قرار بالفعل");
              }
            } catch (error) {
              console.error("خطأ في فحص وجود قرار:", error);
            }
          }
        }
      } else {
        // إذا كانت الحالة ليست "قيد المناقشة" أو لا توجد فترة مناقشة محددة
        console.log("الحالة ليست قيد المناقشة أو لا توجد فترة مناقشة محددة");
      }
      
      // تحديث حالة العرض مرة واحدة فقط في نهاية الفحص
      setDisplayStatus(newStatus);
    };
    
    checkTimeExpired();
  }, [status, created_at, discussion_period, ideaId]);

  // إضافة سجلات للتصحيح
  console.log("حالة العرض النهائية:", displayStatus);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
