
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
  const [alreadyUpdated, setAlreadyUpdated] = useState(false);

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
      if (expired && !isExpired && ideaId && !alreadyUpdated) {
        setIsExpired(true);
        
        try {
          // التحقق من الحالة الحالية للفكرة
          console.log("⏲️ المناقشة انتهت. التحقق من حالة الفكرة الحالية:", ideaId);
          const { data: ideaData, error: ideaError } = await supabase
            .from("ideas")
            .select("status")
            .eq("id", ideaId)
            .single();
            
          if (ideaError) {
            console.error("⚠️ خطأ في التحقق من حالة الفكرة:", ideaError);
            return;
          }
          
          console.log("🔍 الحالة الحالية للفكرة:", ideaData?.status);
          
          // التحقق من وجود قرار للفكرة
          console.log("🔍 التحقق من وجود قرار للفكرة:", ideaId);
          const { data: decisionData, error: decisionError } = await supabase
            .from("idea_decisions")
            .select("id")
            .eq("idea_id", ideaId)
            .maybeSingle();
            
          if (decisionError) {
            console.error("⚠️ خطأ في التحقق من وجود قرار:", decisionError);
            return;
          }
          
          console.log("🔍 هل يوجد قرار؟", decisionData ? "نعم" : "لا");
          
          // تحديث الحالة فقط إذا كانت الفكرة في مرحلة المناقشة وانتهت المدة ولا يوجد قرار
          if (ideaData && 
              (ideaData.status === "under_review" || ideaData.status === "draft") && 
              !decisionData) {
            
            console.log("🔄 بدء تحديث حالة الفكرة إلى 'pending_decision'");
            
            const { error: updateError } = await supabase
              .from("ideas")
              .update({ status: "pending_decision" })
              .eq("id", ideaId);
              
            if (updateError) {
              console.error("⚠️ خطأ في تحديث حالة الفكرة:", updateError);
              return;
            }
            
            setAlreadyUpdated(true);
            console.log("✅ تم تحديث حالة الفكرة بنجاح إلى 'pending_decision'");
            toast.info("انتهت فترة المناقشة. الفكرة الآن بانتظار القرار.", { duration: 5000 });
          } else {
            console.log("ℹ️ لم يتم تحديث الحالة لأحد الأسباب التالية:");
            console.log("   - الفكرة ليست في مرحلة المناقشة:", ideaData?.status !== "under_review" && ideaData?.status !== "draft");
            console.log("   - يوجد قرار مسبق للفكرة:", !!decisionData);
          }
        } catch (err) {
          console.error("⚠️ خطأ غير متوقع أثناء تحديث حالة الفكرة:", err);
        }
      } else if (expired && !alreadyUpdated && ideaId) {
        console.log("ℹ️ المناقشة منتهية ولكن لم يتم تحديث الحالة بعد. سبب عدم التحديث:");
        console.log("   - الحالة 'isExpired' بالفعل:", isExpired);
        console.log("   - لا يوجد معرف للفكرة:", !ideaId);
        console.log("   - تم التحديث مسبقًا:", alreadyUpdated);
      } else {
        setIsExpired(expired);
      }
    };

    // تنفيذ الحساب فوراً عند التحميل
    console.log("🔄 بدء حساب الوقت المتبقي للمناقشة");
    console.log("📅 تاريخ الإنشاء:", created_at);
    console.log("⏱️ فترة المناقشة:", discussion_period);
    console.log("🆔 معرف الفكرة:", ideaId);
    calculateTimeLeft();
    
    // تنفيذ الحساب كل ثانية
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [discussion_period, created_at, ideaId, isExpired, alreadyUpdated]);

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
