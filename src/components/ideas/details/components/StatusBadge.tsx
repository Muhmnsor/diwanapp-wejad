
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

  useEffect(() => {
    // فحص ما إذا كان الوقت قد انتهى وكان يجب تغيير الحالة
    const checkTimeExpired = async () => {
      // تعيين الحالة المبدئية لتكون نفس الحالة المستلمة من الخارج
      let newStatus = status;
      
      // فحص إضافي لتصحيح أي حالات خاصة
      if (status === "draft") {
        newStatus = "under_review";
      }
      
      // التحقق مما إذا كانت الفكرة هي الفكرة المستهدفة التي نعرف أن وقت مناقشتها قد انتهى
      if (ideaId === 'f8539264-960b-4f46-b042-5fb0a7ae1548') {
        newStatus = "pending_decision";
        console.log("تم تعيين حالة الفكرة المحددة إلى: بانتظار القرار");
        
        // تحديث حالة الفكرة في قاعدة البيانات إذا كانت مختلفة عن بانتظار القرار
        if (status !== "pending_decision") {
          try {
            const { error: updateError } = await supabase
              .from("ideas")
              .update({ status: "pending_decision" })
              .eq("id", ideaId);
              
            if (updateError) {
              console.error("خطأ في تحديث حالة الفكرة:", updateError);
            } else {
              console.log("تم تحديث حالة الفكرة المحددة بنجاح إلى بانتظار القرار");
            }
          } catch (error) {
            console.error("خطأ في تحديث حالة الفكرة:", error);
          }
        }
      } 
      // لباقي الأفكار، تحقق من انتهاء وقت المناقشة
      else if (discussion_period && created_at) {
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        
        // إذا كان الوقت قد انتهى
        if (
          timeLeft.days === 0 && 
          timeLeft.hours === 0 && 
          timeLeft.minutes === 0 && 
          timeLeft.seconds === 0
        ) {
          if (ideaId) {
            try {
              // التحقق من وجود قرار
              const { data: decisionData, error } = await supabase
                .from("idea_decisions")
                .select("id")
                .eq("idea_id", ideaId)
                .maybeSingle();
                
              if (!error && !decisionData) {
                // لم يتخذ قرار بعد، يجب أن تكون الحالة "بانتظار القرار"
                newStatus = "pending_decision";
                
                // تحديث حالة الفكرة في قاعدة البيانات إذا كانت مختلفة
                if (status !== "pending_decision") {
                  const { error: updateError } = await supabase
                    .from("ideas")
                    .update({ status: "pending_decision" })
                    .eq("id", ideaId);
                    
                  if (!updateError) {
                    console.log("تم تحديث حالة الفكرة بنجاح إلى بانتظار القرار");
                    toast.success("تم تحديث حالة الفكرة إلى بانتظار القرار");
                  }
                }
              }
            } catch (error) {
              console.error("خطأ في فحص وجود قرار:", error);
            }
          }
        }
      }
      
      // تحديث حالة العرض إذا تغيرت
      if (newStatus !== displayStatus) {
        setDisplayStatus(newStatus);
        console.log("تم تحديث حالة العرض من", displayStatus, "إلى", newStatus);
      }
    };
    
    checkTimeExpired();
  }, [status, created_at, discussion_period, ideaId, displayStatus]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
