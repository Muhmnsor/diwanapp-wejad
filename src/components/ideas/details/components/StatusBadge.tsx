
import { useEffect } from "react";
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
import { useIdeaStatus } from "../hooks/useIdeaStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StatusBadgeProps {
  status: string;
  created_at?: string;
  discussion_period?: string;
  ideaId?: string;
}

export const StatusBadge = ({ 
  status: initialStatus,
  created_at,
  discussion_period,
  ideaId 
}: StatusBadgeProps) => {
  const [status] = useIdeaStatus(ideaId || '', initialStatus);

  useEffect(() => {
    if (!ideaId || !created_at || !discussion_period || status !== 'under_review') {
      return;
    }

    const checkDiscussionStatus = async () => {
      try {
        // تحويل صيغة المناقشة بشكل صحيح
        let totalHours = 0;
        
        if (discussion_period.includes('hour')) {
          const match = discussion_period.match(/(\d+)\s*hour/);
          if (match && match[1]) {
            totalHours = parseInt(match[1], 10);
          }
        } else if (discussion_period.includes('day')) {
          const match = discussion_period.match(/(\d+)\s*day/);
          if (match && match[1]) {
            totalHours = parseInt(match[1], 10) * 24;
          }
        } else {
          // محاولة تفسير الصيغة كرقم مباشر
          const hours = parseInt(discussion_period, 10);
          if (!isNaN(hours)) {
            totalHours = hours;
          }
        }
        
        console.log("عدد الساعات المحسوبة:", totalHours);
        
        if (totalHours > 0) {
          const creationDate = new Date(created_at);
          const endDate = new Date(creationDate.getTime() + totalHours * 60 * 60 * 1000);
          const now = new Date();
          
          console.log("تاريخ الإنشاء:", creationDate.toLocaleString());
          console.log("تاريخ انتهاء المناقشة:", endDate.toLocaleString());
          console.log("الوقت الحالي:", now.toLocaleString());
          
          if (now > endDate) {
            console.log("انتهت فترة المناقشة، التحقق من القرارات...");
            
            // التحقق من عدم وجود قرار
            const { data: decision, error: decisionError } = await supabase
              .from('idea_decisions')
              .select('id')
              .eq('idea_id', ideaId)
              .maybeSingle();
              
            if (decisionError) {
              console.error("خطأ أثناء التحقق من القرارات:", decisionError);
              return;
            }
            
            if (!decision) {
              console.log("لا يوجد قرار متخذ، تحديث الحالة...");
              
              const { error: updateError } = await supabase
                .from('ideas')
                .update({ status: 'pending_decision' })
                .eq('id', ideaId);
                
              if (updateError) {
                console.error("خطأ أثناء تحديث الحالة:", updateError);
                return;
              }
              
              console.log("تم تحديث الحالة إلى 'pending_decision' بنجاح");
              toast.success("تم تحديث حالة الفكرة إلى 'بانتظار القرار'");
            } else {
              console.log("يوجد قرار متخذ بالفعل، لا داعي للتحديث");
            }
          } else {
            const timeLeft = endDate.getTime() - now.getTime();
            console.log(`المناقشة لا تزال جارية. الوقت المتبقي: ${Math.floor(timeLeft / (1000 * 60 * 60))} ساعة و ${Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))} دقيقة`);
          }
        }
      } catch (error) {
        console.error("خطأ أثناء فحص حالة المناقشة:", error);
      }
    };
    
    // تنفيذ الفحص عند تحميل المكون
    checkDiscussionStatus();
    
    // إعداد فحص دوري كل دقيقة
    const intervalId = setInterval(checkDiscussionStatus, 60000);
    return () => clearInterval(intervalId);
  }, [ideaId, created_at, discussion_period, status]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
      {getStatusDisplay(status)}
    </span>
  );
};
