
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useIdeaStatus = (ideaId: string, initialStatus: string) => {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (!ideaId) return;

    // تحديث مباشر للحالة
    const updateStatus = async (newStatus: string) => {
      try {
        const { error } = await supabase
          .from('ideas')
          .update({ status: newStatus })
          .eq('id', ideaId);

        if (error) {
          console.error('خطأ في تحديث الحالة:', error);
          return;
        }

        setStatus(newStatus);
      } catch (err) {
        console.error('خطأ:', err);
      }
    };

    // متابعة التغييرات في الوقت الحقيقي
    const channel = supabase
      .channel('idea_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ideas',
          filter: `id=eq.${ideaId}`
        },
        (payload) => {
          if (payload.new.status !== status) {
            setStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [ideaId, status]);

  return [status, setStatus] as const;
};
