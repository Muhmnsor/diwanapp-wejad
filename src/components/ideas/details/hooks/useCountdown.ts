
import { useState, useEffect, useRef } from "react";
import { calculateTimeRemaining, CountdownTime } from "../utils/countdownUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseCountdownProps {
  discussion_period?: string;
  created_at: string;
  ideaId?: string;
}

export const useCountdown = ({ discussion_period, created_at, ideaId }: UseCountdownProps) => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  const lastDiscussionPeriod = useRef<string | undefined>(discussion_period);
  const lastCreatedAt = useRef<string>(created_at);

  // Effect to detect changes in discussion period or created_at
  useEffect(() => {
    if (discussion_period !== lastDiscussionPeriod.current || created_at !== lastCreatedAt.current) {
      console.log("🔄 Discussion period or created_at changed, recalculating countdown...");
      console.log("Previous discussion period:", lastDiscussionPeriod.current);
      console.log("New discussion period:", discussion_period);
      
      // Recalculate immediately
      const timeLeft = calculateTimeRemaining(discussion_period, created_at);
      setCountdown(timeLeft);
      
      // Update expiration status
      const expired = 
        timeLeft.days === 0 && 
        timeLeft.hours === 0 && 
        timeLeft.minutes === 0 && 
        timeLeft.seconds === 0;
      
      if (expired !== isExpired) {
        console.log(`Expiration status changed from ${isExpired} to ${expired}`);
        setIsExpired(expired);
      }
      
      // Update refs
      lastDiscussionPeriod.current = discussion_period;
      lastCreatedAt.current = created_at;
    }
  }, [discussion_period, created_at, isExpired]);

  useEffect(() => {
    // تحديث حالة الفكرة عندما تنتهي المناقشة
    const updateIdeaStatusIfExpired = async () => {
      if (!ideaId || !isExpired) return;

      try {
        console.log("Discussion expired, checking current idea status...");
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
        console.log(`⏲️ تغيير حالة انتهاء المناقشة من ${isExpired} إلى ${expired}`);
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

  return {
    countdown,
    isExpired
  };
};
