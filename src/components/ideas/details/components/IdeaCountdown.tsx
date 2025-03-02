
import { useEffect, useState } from "react";
import { calculateTimeRemaining, getCountdownDisplay, CountdownTime, extractTotalHours, formatTotalPeriod } from "../utils/countdownUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IdeaCountdownProps {
  discussion_period?: string;
  created_at: string;
  ideaId?: string;
}

export const IdeaCountdown = ({ discussion_period, created_at, ideaId }: IdeaCountdownProps) => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // تحديث حالة الفكرة عندما تنتهي المناقشة
    const updateIdeaStatusIfExpired = async () => {
      if (!ideaId || !isExpired) return;

      try {
        // أولاً، تحقق من الحالة الحالية للفكرة
        const { data: ideaData, error: fetchError } = await supabase
          .from('ideas')
          .select('status')
          .eq('id', ideaId)
          .single();

        if (fetchError) {
          console.error("خطأ في جلب حالة الفكرة:", fetchError);
          return;
        }

        // إذا كانت الفكرة لا تزال في حالة المناقشة وانتهى الوقت
        if (ideaData && (ideaData.status === 'draft' || ideaData.status === 'under_review')) {
          console.log("المناقشة انتهت، تحديث حالة الفكرة إلى بانتظار القرار");
          
          const { error: updateError } = await supabase
            .from('ideas')
            .update({ status: 'pending_decision' })
            .eq('id', ideaId);

          if (updateError) {
            console.error("خطأ في تحديث حالة الفكرة:", updateError);
          } else {
            toast.info("تم تحديث حالة الفكرة إلى: بانتظار القرار", { duration: 3000 });
          }
        }
      } catch (err) {
        console.error("خطأ غير متوقع عند تحديث حالة الفكرة:", err);
      }
    };

    const calculateTimeLeft = () => {
      const timeLeft = calculateTimeRemaining(discussion_period, created_at);
      setCountdown(timeLeft);
      
      // التحقق مما إذا كان الوقت منتهي (كل القيم = 0)
      const expired = 
        timeLeft.days === 0 && 
        timeLeft.hours === 0 && 
        timeLeft.minutes === 0 && 
        timeLeft.seconds === 0;
      
      // تحديث حالة انتهاء المناقشة محلياً
      if (expired !== isExpired) {
        setIsExpired(expired);
        
        // عرض إشعار عند انتهاء فترة المناقشة
        if (expired && !isExpired) {
          console.log("⏲️ انتهت فترة المناقشة للفكرة:", ideaId);
          toast.info("انتهت فترة المناقشة", { duration: 3000 });
          
          // عند انتهاء المناقشة، قم بتحديث حالة الفكرة
          if (ideaId) {
            updateIdeaStatusIfExpired();
          }
        }
      }
    };

    // تنفيذ الحساب فوراً عند التحميل
    console.log("🔄 بدء حساب الوقت المتبقي للمناقشة");
    console.log("📅 تاريخ الإنشاء:", created_at);
    console.log("⏱️ فترة المناقشة:", discussion_period);
    calculateTimeLeft();
    
    // التحقق من الحالة عند التحميل أيضًا
    if (isExpired && ideaId) {
      updateIdeaStatusIfExpired();
    }
    
    // تنفيذ الحساب كل ثانية
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [discussion_period, created_at, isExpired, ideaId]);

  if (!discussion_period) {
    return (
      <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm">
        <span className="font-medium text-purple-800">المناقشة:</span>
        <div className="font-bold text-purple-700">غير محددة</div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 rounded-lg py-1.5 px-2 text-sm">
        <span className="font-medium text-amber-800">حالة المناقشة:</span>
        <div className="font-bold text-amber-700">انتهت المناقشة</div>
      </div>
    );
  }

  // نعرض المدة الكلية مع الوقت المتبقي للتوافق
  const totalHours = extractTotalHours(discussion_period);
  const totalPeriod = formatTotalPeriod(totalHours);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 bg-gray-50 rounded-lg py-1 px-2 text-xs">
        <span className="font-medium text-gray-700">الفترة الكلية:</span>
        <div className="font-medium text-gray-700">{totalPeriod}</div>
      </div>
      
      <div className="flex items-center gap-2 bg-blue-50 rounded-lg py-1.5 px-2 text-sm">
        <span className="font-medium text-blue-800">متبقي للمناقشة:</span>
        <div className="font-bold text-blue-700">
          {getCountdownDisplay(discussion_period, created_at, countdown)}
        </div>
      </div>
    </div>
  );
};
