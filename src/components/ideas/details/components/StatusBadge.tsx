
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
    // فحص ما إذا كان الوقت قد انتهى وكان يجب تغيير الحالة
    const checkTimeExpired = async () => {
      // تعيين الحالة المبدئية لتكون نفس الحالة المستلمة من الخارج
      let newStatus = status;
      
      try {
        console.log("StatusBadge - معلومات الحالة:");
        console.log("الحالة الأصلية المستلمة:", status);
        console.log("فترة المناقشة:", discussion_period);
        console.log("تاريخ الإنشاء:", created_at);
        
        // التحقق إذا كانت المعلومات غير مكتملة
        if (!ideaId || !created_at) {
          console.log("معلومات الفكرة غير مكتملة، سيتم استخدام الحالة الأصلية:", status);
          return;
        }
        
        // فحص وجود قرار أولاً - إذا كان هناك قرار، فيجب أن تكون الحالة مطابقة للقرار
        const { data: decisionData, error: decisionError } = await supabase
          .from("idea_decisions")
          .select("status")
          .eq("idea_id", ideaId)
          .maybeSingle();
          
        if (decisionError) {
          console.error("خطأ في جلب بيانات القرار:", decisionError);
        }
          
        console.log("بيانات القرار:", decisionData);
        
        if (decisionData && decisionData.status) {
          // تم العثور على قرار، يجب أن تكون الحالة مطابقة للقرار
          console.log("تم العثور على قرار بحالة:", decisionData.status);
          newStatus = decisionData.status;
        } else {
          // لم يتم العثور على قرار، تحقق من وقت المناقشة
          console.log("لم يتم العثور على قرار، التحقق من وقت المناقشة");
          
          if (discussion_period) {
            const timeLeft = calculateTimeRemaining(discussion_period, created_at);
            console.log("الوقت المتبقي:", timeLeft);
            
            // إذا كان الوقت قد انتهى ولا يوجد قرار
            if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
              console.log("انتهى وقت المناقشة، تغيير الحالة إلى بانتظار القرار");
              
              // تحديث قاعدة البيانات فقط إذا كانت الحالة الحالية ليست بانتظار القرار بالفعل
              if (status !== "pending_decision" && !isUpdating) {
                setIsUpdating(true);
                newStatus = "pending_decision";
                
                const { error: updateError } = await supabase
                  .from("ideas")
                  .update({ status: "pending_decision" })
                  .eq("id", ideaId);
                  
                if (updateError) {
                  console.error("خطأ في تحديث حالة الفكرة:", updateError);
                  toast.error("حدث خطأ أثناء تحديث حالة الفكرة");
                } else {
                  console.log("تم تحديث حالة الفكرة بنجاح إلى بانتظار القرار");
                  toast.success("تم تحديث حالة الفكرة إلى بانتظار القرار");
                  
                  // إعادة تحميل الصفحة بعد التحديث الناجح لضمان تحديث البيانات
                  window.location.reload();
                }
                setIsUpdating(false);
              } else {
                newStatus = "pending_decision";
              }
            } else if (status === "draft") {
              // التأكد من أن الحالة هي "تحت المراجعة" إذا كانت مسودة
              console.log("الفكرة في حالة مسودة، تحديثها إلى تحت المراجعة");
              newStatus = "under_review";
              
              if (!isUpdating) {
                setIsUpdating(true);
                // تحديث قاعدة البيانات
                const { error: updateError } = await supabase
                  .from("ideas")
                  .update({ status: "under_review" })
                  .eq("id", ideaId);
                  
                if (updateError) {
                  console.error("خطأ في تحديث حالة الفكرة من مسودة إلى تحت المراجعة:", updateError);
                } else {
                  console.log("تم تحديث حالة الفكرة بنجاح من مسودة إلى تحت المراجعة");
                }
                setIsUpdating(false);
              }
            } else {
              // الوقت لم ينته بعد، احترام الحالة الحالية
              console.log("الوقت لم ينته بعد، الإبقاء على الحالة الحالية:", status);
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
        
        // تحديث حالة العرض إذا كانت مختلفة
        if (newStatus !== displayStatus) {
          console.log("تم تحديث حالة العرض من", displayStatus, "إلى", newStatus);
          setDisplayStatus(newStatus);
        }
        
        console.log("الحالة النهائية المعروضة:", newStatus);
        console.log("نص العرض النهائي:", getStatusDisplay(newStatus));
      } catch (error) {
        console.error("خطأ في فحص حالة الفكرة:", error);
      }
    };
    
    checkTimeExpired();
    
    // إضافة فحص دوري كل 30 ثانية للتحقق من حالة الفكرة
    const intervalId = setInterval(checkTimeExpired, 30000);
    
    // تنظيف الفاصل الزمني عند إزالة المكون
    return () => clearInterval(intervalId);
  }, [status, created_at, discussion_period, ideaId, displayStatus, isUpdating]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
