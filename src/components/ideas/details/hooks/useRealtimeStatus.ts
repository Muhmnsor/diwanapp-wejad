
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showStatusNotification } from "../utils/statusNotifications";

interface UseRealtimeStatusProps {
  ideaId?: string;
  initialStatus: string;
  onStatusChange: (newStatus: string) => void;
}

export const useRealtimeStatus = ({ 
  ideaId, 
  initialStatus,
  onStatusChange 
}: UseRealtimeStatusProps) => {
  const [status, setStatus] = useState(initialStatus);

  // إعداد قناة الاستماع للتغييرات في الوقت الحقيقي
  useEffect(() => {
    if (!ideaId) return;
    
    console.log("📡 إعداد قناة الاستماع للتغييرات في الوقت الحقيقي للفكرة:", ideaId);
    const channel = supabase
      .channel(`idea-status-${ideaId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ideas',
          filter: `id=eq.${ideaId}`
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as any;
            console.log(`📢 تم استلام تحديث من قاعدة البيانات:`, newData);
            
            // تحديث الحالة في واجهة المستخدم إذا تغيرت
            if (newData.status && newData.status !== status) {
              console.log(`🔄 تحديث الحالة من "${status}" إلى "${newData.status}"`);
              setStatus(newData.status);
              onStatusChange(newData.status);
              
              // عرض إشعار عند تغيير الحالة
              showStatusNotification(newData.status);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 حالة الاشتراك في التغييرات:", status);
      });
      
    // تنظيف الاشتراك عند إلغاء تحميل المكون
    return () => {
      console.log("🧹 إلغاء الاشتراك في قناة التغييرات");
      supabase.removeChannel(channel);
    };
  }, [ideaId, initialStatus, status, onStatusChange]);

  return { status, setStatus };
};
