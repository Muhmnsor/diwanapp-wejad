
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
      console.log("StatusBadge - معلومات الحالة:");
      console.log("الحالة الأصلية المستلمة:", status);
      console.log("فترة المناقشة:", discussion_period);
      console.log("تاريخ الإنشاء:", created_at);
      
      // تعيين الحالة المبدئية لتكون نفس الحالة المستلمة من الخارج
      let newStatus = status;
      
      // فحص وجود قرار أولاً - إذا كان هناك قرار، فيجب أن تكون الحالة مطابقة للقرار
      if (ideaId) {
        try {
          const { data: decisionData, error } = await supabase
            .from("idea_decisions")
            .select("status")
            .eq("idea_id", ideaId)
            .maybeSingle();
            
          console.log("بيانات القرار:", decisionData);
          
          if (!error && decisionData && decisionData.status) {
            // تم العثور على قرار، يجب أن تكون الحالة مطابقة للقرار
            console.log("تم العثور على قرار بحالة:", decisionData.status);
            newStatus = decisionData.status;
          } else {
            // لم يتم العثور على قرار، تحقق من وقت المناقشة
            console.log("لم يتم العثور على قرار، التحقق من وقت المناقشة");
            
            if (discussion_period && created_at) {
              const timeLeft = calculateTimeRemaining(discussion_period, created_at);
              console.log("الوقت المتبقي:", timeLeft);
              
              // إذا كان الوقت قد انتهى ولا يوجد قرار
              if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                console.log("انتهى وقت المناقشة، تغيير الحالة إلى بانتظار القرار");
                newStatus = "pending_decision";
                
                // تحديث قاعدة البيانات فقط إذا كانت الحالة الحالية ليست بانتظار القرار بالفعل
                if (status !== "pending_decision") {
                  const { error: updateError } = await supabase
                    .from("ideas")
                    .update({ status: "pending_decision" })
                    .eq("id", ideaId);
                    
                  if (updateError) {
                    console.error("خطأ في تحديث حالة الفكرة:", updateError);
                  } else {
                    console.log("تم تحديث حالة الفكرة بنجاح إلى بانتظار القرار");
                  }
                }
              } else {
                // الوقت لم ينته بعد، الحالة يجب أن تكون قيد المناقشة
                console.log("الوقت لم ينته بعد، الحالة يجب أن تكون قيد المناقشة");
                
                // التأكد من أن الحالة هي "تحت المراجعة" إذا كانت مسودة
                if (status === "draft") {
                  newStatus = "under_review";
                  
                  // تحديث قاعدة البيانات
                  const { error: updateError } = await supabase
                    .from("ideas")
                    .update({ status: "under_review" })
                    .eq("id", ideaId);
                    
                  if (updateError) {
                    console.error("خطأ في تحديث حالة الفكرة من مسودة إلى تحت المراجعة:", updateError);
                  }
                } else if (status !== "under_review") {
                  // إذا كانت الحالة ليست "تحت المراجعة" وليست "مسودة"، ولكن الوقت لم ينته
                  // هذا قد يكون بسبب تدخل يدوي في الحالة، لذا نحترم الحالة الحالية
                  console.log("حالة خاصة: الوقت لم ينته لكن الحالة ليست قيد المناقشة:", status);
                } else {
                  newStatus = "under_review";
                }
              }
            } else {
              // لا توجد فترة مناقشة محددة
              console.log("لا توجد فترة مناقشة محددة، الإبقاء على الحالة الحالية:", status);
              
              // التأكد من أن الحالة ليست فارغة أو مسودة
              if (!status || status === "draft") {
                newStatus = "under_review";
              }
            }
          }
        } catch (error) {
          console.error("خطأ في فحص وجود قرار:", error);
        }
      }
      
      // تحديث حالة العرض إذا كانت مختلفة
      if (newStatus !== displayStatus) {
        setDisplayStatus(newStatus);
        console.log("تم تحديث حالة العرض من", displayStatus, "إلى", newStatus);
      }
      
      console.log("الحالة النهائية المعروضة:", newStatus);
      console.log("نص العرض النهائي:", getStatusDisplay(newStatus));
    };
    
    checkTimeExpired();
  }, [status, created_at, discussion_period, ideaId, displayStatus]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
