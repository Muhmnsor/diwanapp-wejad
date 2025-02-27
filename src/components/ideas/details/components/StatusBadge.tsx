
import { useEffect } from "react";
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
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
  // استخدام فقط لاستخراج قيمة الحالة بدون هوك مخصص
  const [status, setStatus] = React.useState(initialStatus);
  
  // جلب الحالة الحديثة عند التحميل والتحديث عند كل تغيير
  useEffect(() => {
    if (!ideaId) return;
    
    // جلب الحالة الحالية من قاعدة البيانات
    const fetchStatus = async () => {
      try {
        console.log("جلب حالة الفكرة:", ideaId);
        const { data, error } = await supabase
          .from('ideas')
          .select('status')
          .eq('id', ideaId)
          .single();
          
        if (error) {
          console.error("خطأ في جلب حالة الفكرة:", error);
          return;
        }
        
        if (data && data.status !== status) {
          console.log(`تحديث حالة الفكرة من "${status}" إلى "${data.status}"`);
          setStatus(data.status);
        }
      } catch (err) {
        console.error("خطأ غير متوقع:", err);
      }
    };

    // جلب الحالة فوراً
    fetchStatus();
    
    // إعداد قناة الاستماع للتغييرات في الوقت الحقيقي
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
          if (payload.new && payload.new.status !== status) {
            console.log(`تلقي تحديث حالة جديد من قاعدة البيانات: "${payload.new.status}"`);
            setStatus(payload.new.status);
          }
        }
      )
      .subscribe((status) => {
        console.log("حالة الاشتراك:", status);
      });
      
    return () => {
      console.log("إلغاء الاشتراك في قناة التغييرات");
      supabase.removeChannel(channel);
    };
  }, [ideaId, initialStatus]);

  // سجل الحالة الحالية لأغراض التصحيح
  console.log(`عرض الحالة: "${status}" (${typeof status})`);
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
      {getStatusDisplay(status)}
    </span>
  );
};
