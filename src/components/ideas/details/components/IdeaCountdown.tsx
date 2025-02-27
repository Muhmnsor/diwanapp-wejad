
import { useEffect, useState } from "react";
import { calculateTimeRemaining, getCountdownDisplay, CountdownTime } from "../utils/countdownUtils";
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
    const calculateTimeLeft = () => {
      const timeLeft = calculateTimeRemaining(discussion_period, created_at);
      setCountdown(timeLeft);
      
      // التحقق مما إذا كان الوقت منتهي (كل القيم = 0)
      const expired = 
        timeLeft.days === 0 && 
        timeLeft.hours === 0 && 
        timeLeft.minutes === 0 && 
        timeLeft.seconds === 0;
      
      // تحديث حالة انتهاء المناقشة محلياً فقط
      if (expired !== isExpired) {
        setIsExpired(expired);
        
        // عرض إشعار عند انتهاء فترة المناقشة
        if (expired && !isExpired) {
          console.log("⏲️ انتهت فترة المناقشة للفكرة:", ideaId);
          toast.info("انتهت فترة المناقشة", { duration: 3000 });
        }
      }
    };

    // تنفيذ الحساب فوراً عند التحميل
    console.log("🔄 بدء حساب الوقت المتبقي للمناقشة");
    console.log("📅 تاريخ الإنشاء:", created_at);
    console.log("⏱️ فترة المناقشة:", discussion_period);
    calculateTimeLeft();
    
    // تنفيذ الحساب كل ثانية
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [discussion_period, created_at, isExpired]);

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

  return (
    <div className="flex items-center gap-2 bg-blue-50 rounded-lg py-1.5 px-2 text-sm">
      <span className="font-medium text-blue-800">متبقي للمناقشة:</span>
      <div className="font-bold text-blue-700">
        {getCountdownDisplay(discussion_period, created_at, countdown)}
      </div>
    </div>
  );
};
