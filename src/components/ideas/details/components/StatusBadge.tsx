
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

  // تنفيذ تحديث الحالة بناءً على الشروط
  const updateIdeaStatus = async (newStatus: string) => {
    if (!ideaId || isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log("جاري تحديث حالة الفكرة إلى:", newStatus);
      
      const { error } = await supabase
        .from("ideas")
        .update({ status: newStatus })
        .eq("id", ideaId);
        
      if (error) {
        console.error("فشل تحديث حالة الفكرة:", error);
        toast.error("حدث خطأ أثناء تحديث حالة الفكرة");
      } else {
        console.log("تم تحديث حالة الفكرة بنجاح إلى:", newStatus);
        toast.success(`تم تحديث حالة الفكرة إلى: ${getStatusDisplay(newStatus)}`);
        
        // تعيين الحالة الجديدة محليًا
        setDisplayStatus(newStatus);
        
        // إعادة تحميل الصفحة بعد تأخير قصير لضمان تحديث البيانات
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error("حدث خطأ أثناء تحديث الحالة:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    // فحص ما إذا كان الوقت قد انتهى وكان يجب تغيير الحالة
    const checkTimeExpired = async () => {
      try {
        console.log("StatusBadge - معلومات الحالة الحالية:");
        console.log("الحالة الأصلية المستلمة:", status);
        console.log("فترة المناقشة:", discussion_period);
        console.log("تاريخ الإنشاء:", created_at);
        
        // التحقق إذا كانت المعلومات غير مكتملة
        if (!ideaId || !created_at) {
          console.log("معلومات الفكرة غير مكتملة، سيتم استخدام الحالة الأصلية");
          return;
        }
        
        // فحص وجود قرار أولاً
        const { data: decisionData, error: decisionError } = await supabase
          .from("idea_decisions")
          .select("status")
          .eq("idea_id", ideaId)
          .maybeSingle();
          
        if (decisionError) {
          console.error("خطأ في جلب بيانات القرار:", decisionError);
        }
          
        console.log("بيانات القرار:", decisionData);
        
        // إذا كان هناك قرار، يجب أن تكون الحالة مطابقة للقرار
        if (decisionData && decisionData.status) {
          console.log("تم العثور على قرار بحالة:", decisionData.status);
          
          if (status !== decisionData.status) {
            // تحديث الحالة لتتطابق مع القرار
            updateIdeaStatus(decisionData.status);
          } else {
            setDisplayStatus(decisionData.status);
          }
          return;
        }
        
        // لم يتم العثور على قرار، التحقق من وقت المناقشة
        console.log("لم يتم العثور على قرار، التحقق من وقت المناقشة");
        
        if (!discussion_period) {
          console.log("لا توجد فترة مناقشة محددة");
          
          // التأكد من أن الحالة ليست فارغة أو مسودة
          if (!status || status === "draft") {
            updateIdeaStatus("under_review");
          }
          return;
        }
        
        // حساب الوقت المتبقي للمناقشة
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        console.log("الوقت المتبقي للمناقشة:", timeLeft);
        
        // التحقق مما إذا كان الوقت قد انتهى
        const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && 
                          timeLeft.minutes === 0 && timeLeft.seconds === 0;
                          
        // إذا انتهى الوقت والحالة ليست "بانتظار القرار"
        if (isExpired && status !== "pending_decision") {
          console.log("انتهى وقت المناقشة، الحالة الحالية:", status);
          console.log("تغيير الحالة إلى بانتظار القرار");
          
          // تحديث حالة الفكرة في قاعدة البيانات إلى "بانتظار القرار"
          updateIdeaStatus("pending_decision");
        } 
        // إذا كانت الحالة مسودة والمناقشة جارية
        else if (status === "draft" && !isExpired) {
          console.log("الفكرة في حالة مسودة والمناقشة جارية، تحديثها إلى تحت المراجعة");
          updateIdeaStatus("under_review");
        }
        // تحديث عرض الحالة محليًا بناءً على التشخيص
        else if (isExpired) {
          setDisplayStatus("pending_decision");
        } else {
          setDisplayStatus(status);
        }
      } catch (error) {
        console.error("خطأ في فحص حالة الفكرة:", error);
      }
    };
    
    // تنفيذ فحص فوري
    checkTimeExpired();
    
    // إضافة فحص دوري كل 30 ثانية
    const intervalId = setInterval(checkTimeExpired, 30000);
    
    // تنظيف الفاصل الزمني عند إزالة المكون
    return () => clearInterval(intervalId);
  }, [status, created_at, discussion_period, ideaId]);

  // تنفيذ فحص فوري عند تحميل الصفحة للتأكد من تطبيق المنطق الصحيح
  useEffect(() => {
    // فحص مبدئي لمعرفة ما إذا كانت الحالة يجب أن تكون "بانتظار القرار"
    const checkInitialStatus = async () => {
      try {
        if (!discussion_period || !created_at) return;
        
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && 
                          timeLeft.minutes === 0 && timeLeft.seconds === 0;
                          
        // تحديث العرض المحلي فوراً إذا انتهى الوقت
        if (isExpired && status !== "pending_decision") {
          setDisplayStatus("pending_decision");
          console.warn("تم اكتشاف انتهاء وقت المناقشة في التحقق المبدئي، تحديث العرض المحلي");
        }
      } catch (err) {
        console.error("خطأ في التحقق المبدئي من الحالة:", err);
      }
    };
    
    checkInitialStatus();
  }, []);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
