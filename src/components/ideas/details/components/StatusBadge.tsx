
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
      // سجلات تصحيح مفصلة
      console.log("StatusBadge - معلومات الحالة:");
      console.log("الحالة الأصلية المستلمة:", status);
      console.log("نوع الحالة:", typeof status);
      console.log("قيمة العرض الأولية:", getStatusDisplay(status));
      console.log("فترة المناقشة:", discussion_period);
      console.log("تاريخ الإنشاء:", created_at);
      
      // تعيين الحالة المبدئية لتكون نفس الحالة المستلمة من الخارج
      let newStatus = status;
      
      // التحقق من انتهاء فترة المناقشة مباشرة بغض النظر عن الحالة الحالية
      if (discussion_period && created_at) {
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        console.log("الوقت المتبقي:", timeLeft);
        
        // إذا كان الوقت قد انتهى
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
                
                // تحديث حالة الفكرة في قاعدة البيانات إذا كانت مختلفة
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
              } else if (decisionData) {
                console.log("يوجد قرار بالفعل");
              }
            } catch (error) {
              console.error("خطأ في فحص وجود قرار:", error);
            }
          }
        } else if (status === "under_review") {
          console.log("الفكرة لا تزال في فترة المناقشة");
          newStatus = "under_review";
        }
      } else {
        // إذا لا توجد فترة مناقشة محددة
        console.log("لا توجد فترة مناقشة محددة:", status);
        
        // فحص إضافي لمعرفة القيمة الدقيقة للحالة
        if (status === null || status === undefined || status === "") {
          console.log("⚠️ الحالة فارغة أو غير معرفة");
          newStatus = "under_review"; // قيمة افتراضية
        } else if (status === "draft") {
          console.log("⚠️ الحالة هي مسودة (draft)");
          newStatus = "under_review"; // تحويل مسودة إلى قيد المناقشة
        }
      }
      
      // تحديث حالة العرض فقط إذا كانت مختلفة عن الحالة السابقة
      if (newStatus !== displayStatus) {
        setDisplayStatus(newStatus);
        console.log("تم تحديث الحالة من", displayStatus, "إلى", newStatus);
      }

      console.log("الحالة النهائية بعد المعالجة:", newStatus);
      console.log("نص العرض النهائي:", getStatusDisplay(newStatus));
      console.log("صف التنسيق النهائي:", getStatusClass(newStatus));
    };
    
    checkTimeExpired();
  }, [status, created_at, discussion_period, ideaId, displayStatus]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
