
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
import { useEffect, useState, useCallback } from "react";
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
  
  // تنفيذ تحديث الحالة بطريقة مباشرة وفورية
  const updateIdeaStatus = useCallback(async (newStatus: string) => {
    if (!ideaId || isUpdating) return;
    
    try {
      setIsUpdating(true);
      console.log("محاولة مباشرة لتحديث حالة الفكرة إلى:", newStatus);
      
      // تحديث قاعدة البيانات مباشرة
      const { error } = await supabase
        .from("ideas")
        .update({ status: newStatus })
        .eq("id", ideaId);
        
      if (error) {
        console.error("خطأ مباشر في تحديث الفكرة:", error);
        toast.error("فشل تحديث حالة الفكرة: " + error.message);
      } else {
        console.log("تم تحديث قاعدة البيانات بنجاح إلى:", newStatus);
        toast.success("تم تحديث حالة الفكرة إلى: " + getStatusDisplay(newStatus));
        
        // تحديث الحالة المعروضة محلياً
        setDisplayStatus(newStatus);
        
        // إعادة تحميل الصفحة بعد 2 ثانية
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error("استثناء في تحديث حالة الفكرة:", err);
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsUpdating(false);
    }
  }, [ideaId, isUpdating]);

  // التحقق من حالة الفكرة والتحديث إذا لزم الأمر
  const checkIdeaStatus = useCallback(async () => {
    if (!ideaId || !created_at || isUpdating) return;
    
    try {
      console.log("التحقق من حالة الفكرة (معرّف الفكرة، الحالة):", ideaId, status);
      
      // التحقق من حالة الفكرة في قاعدة البيانات مباشرة للتأكد من الحالة الحالية
      const { data: currentIdeaData, error: ideaError } = await supabase
        .from("ideas")
        .select("status")
        .eq("id", ideaId)
        .maybeSingle();
        
      if (ideaError) {
        console.error("خطأ في جلب حالة الفكرة:", ideaError);
        return;
      }
      
      const currentDbStatus = currentIdeaData?.status || status;
      console.log("الحالة الحالية في قاعدة البيانات:", currentDbStatus);
      
      // التحقق من وجود قرار للفكرة
      const { data: decisionData, error: decisionError } = await supabase
        .from("idea_decisions")
        .select("status")
        .eq("idea_id", ideaId)
        .maybeSingle();
      
      if (decisionError && decisionError.code !== 'PGRST116') {
        console.error("خطأ في جلب بيانات القرار:", decisionError);
      }
      
      if (decisionData?.status) {
        // إذا كان هناك قرار، تحديث الحالة لتتطابق مع القرار
        console.log("وجد قرار:", decisionData.status);
        
        if (currentDbStatus !== decisionData.status) {
          console.log("تحديث الحالة لتتوافق مع القرار:", decisionData.status);
          await updateIdeaStatus(decisionData.status);
        } else {
          // عرض حالة القرار محلياً حتى لو كانت متطابقة
          setDisplayStatus(decisionData.status);
        }
        return;
      }
      
      // تحديد ما إذا كان وقت المناقشة قد انتهى
      if (discussion_period) {
        const timeLeft = calculateTimeRemaining(discussion_period, created_at);
        console.log("الوقت المتبقي للمناقشة:", timeLeft);
        
        const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && 
                          timeLeft.minutes === 0 && timeLeft.seconds === 0;
                          
        if (isExpired) {
          console.log("وقت المناقشة منتهي، الحالة الحالية في قاعدة البيانات:", currentDbStatus);
          
          if (currentDbStatus !== "pending_decision") {
            console.log("محاولة تحديث الحالة إلى 'بانتظار القرار'");
            // تحديث الحالة في قاعدة البيانات مباشرة وفوراً
            await updateIdeaStatus("pending_decision");
          } else {
            // حتى إذا كانت الحالة صحيحة في قاعدة البيانات، تأكد من عرضها محلياً
            setDisplayStatus("pending_decision");
          }
        } else if (currentDbStatus === "draft") {
          // إذا لم ينته وقت المناقشة والحالة هي "مسودة"، حدثها إلى "تحت المراجعة"
          console.log("الحالة 'مسودة' في قاعدة البيانات، تحديثها إلى 'تحت المراجعة'");
          await updateIdeaStatus("under_review");
        } else {
          // عرض الحالة الحالية من قاعدة البيانات
          setDisplayStatus(currentDbStatus);
        }
      } else if (currentDbStatus === "draft") {
        // إذا لم تكن هناك فترة مناقشة والحالة هي "مسودة"، حدثها إلى "تحت المراجعة"
        console.log("لا توجد فترة مناقشة والحالة هي 'مسودة'، تحديثها إلى 'تحت المراجعة'");
        await updateIdeaStatus("under_review");
      } else {
        // عرض الحالة الحالية من قاعدة البيانات
        setDisplayStatus(currentDbStatus);
      }
    } catch (error) {
      console.error("خطأ في التحقق من حالة الفكرة:", error);
    }
  }, [ideaId, status, created_at, discussion_period, updateIdeaStatus, isUpdating]);

  // تنفيذ التحقق الأولي عند تحميل المكون
  useEffect(() => {
    console.log("تنفيذ التحقق الأولي من حالة الفكرة");
    checkIdeaStatus();
    
    // تنفيذ التحقق بشكل دوري
    const intervalId = setInterval(() => {
      console.log("تنفيذ التحقق الدوري من حالة الفكرة");
      checkIdeaStatus();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [checkIdeaStatus]);

  return (
    <span data-idea-id={ideaId} data-original-status={status} data-display-status={displayStatus} className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(displayStatus)}`}>
      {getStatusDisplay(displayStatus)}
    </span>
  );
};
