
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
    const calculateTimeLeft = async () => {
      const timeLeft = calculateTimeRemaining(discussion_period, created_at);
      setCountdown(timeLeft);
      
      // التحقق مما إذا كان الوقت منتهي (كل القيم = 0)
      const expired = 
        timeLeft.days === 0 && 
        timeLeft.hours === 0 && 
        timeLeft.minutes === 0 && 
        timeLeft.seconds === 0;
      
      // إذا انتهى الوقت للتو، قم بتحديث حالة الفكرة
      if (expired && !isExpired && ideaId) {
        setIsExpired(true);
        
        try {
          // التحقق من الحالة الحالية للفكرة
          const { data, error } = await supabase
            .from("ideas")
            .select("status")
            .eq("id", ideaId)
            .single();
            
          if (error) throw error;
          
          // تحديث الحالة فقط إذا كانت الفكرة في مرحلة المراجعة
          if (data && data.status === "under_review") {
            const { error: updateError } = await supabase
              .from("ideas")
              .update({ status: "pending_decision" })
              .eq("id", ideaId);
              
            if (updateError) throw updateError;
            
            toast.info("انتهت فترة المناقشة. الفكرة الآن بانتظار القرار.", { duration: 5000 });
          }
        } catch (err) {
          console.error("Error updating idea status:", err);
        }
      } else {
        setIsExpired(expired);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft(); // تنفيذ فوري للعملية الحسابية

    return () => clearInterval(timer);
  }, [discussion_period, created_at, ideaId, isExpired]);

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
      <div className="flex items-center gap-2 bg-red-50 rounded-lg py-1.5 px-2 text-sm">
        <span className="font-medium text-red-800">حالة المناقشة:</span>
        <div className="font-bold text-red-700">انتهت المناقشة</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm">
      <span className="font-medium text-purple-800">متبقي:</span>
      <div className="font-bold text-purple-700">
        {getCountdownDisplay(discussion_period, created_at, countdown)}
      </div>
    </div>
  );
};
