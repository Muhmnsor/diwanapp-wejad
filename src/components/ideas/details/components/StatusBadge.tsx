
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
      if (discussion_period && created_at && status === "under_review") {
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        
        // إذا كان الوقت قد انتهى والحالة لا تزال "قيد المناقشة"
        if (
          timeLeft.days === 0 && 
          timeLeft.hours === 0 && 
          timeLeft.minutes === 0 && 
          timeLeft.seconds === 0
        ) {
          // التحقق من وجود قرار
          if (ideaId) {
            try {
              const { data: decisionData, error } = await supabase
                .from("idea_decisions")
                .select("id")
                .eq("idea_id", ideaId)
                .maybeSingle();
                
              if (!error && !decisionData) {
                // لم يتخذ قرار بعد، يجب أن تكون الحالة "بانتظار القرار"
                setDisplayStatus("pending_decision");
                
                // تحديث حالة الفكرة في قاعدة البيانات
                if (ideaId) {
                  await supabase
                    .from("ideas")
                    .update({ status: "pending_decision" })
                    .eq("id", ideaId);
                }
              }
            } catch (error) {
              console.error("خطأ في فحص وجود قرار:", error);
            }
          }
        }
      } else {
        setDisplayStatus(status);
      }
    };
    
    checkTimeExpired();
  }, [status, created_at, discussion_period, ideaId]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
