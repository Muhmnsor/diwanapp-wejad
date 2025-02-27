
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
      // تحويل الفترة إلى ساعات
      const hours = Number(discussion_period.split(' ')[0]);
      if (isNaN(hours)) return;

      const endDate = new Date(created_at);
      endDate.setHours(endDate.getHours() + hours);
      
      const now = new Date();
      
      if (now > endDate) {
        console.log('فحص انتهاء المناقشة:', {
          created_at,
          discussion_period,
          endDate: endDate.toISOString(),
          now: now.toISOString()
        });

        // التحقق من عدم وجود قرار
        const { data: decision } = await supabase
          .from('idea_decisions')
          .select('id')
          .eq('idea_id', ideaId)
          .maybeSingle();

        if (!decision) {
          const { error } = await supabase
            .from('ideas')
            .update({ status: 'pending_decision' })
            .eq('id', ideaId);

          if (!error) {
            toast.info('انتهت فترة المناقشة. الفكرة الآن بانتظار القرار.');
          }
        }
      }
    };

    // فحص فوري
    checkDiscussionStatus();

    // فحص دوري كل دقيقة
    const interval = setInterval(checkDiscussionStatus, 60000);
    return () => clearInterval(interval);
  }, [ideaId, created_at, discussion_period, status]);

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
      {getStatusDisplay(status)}
    </span>
  );
};
