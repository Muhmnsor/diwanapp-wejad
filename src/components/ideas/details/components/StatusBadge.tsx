
import React, { useEffect, useState } from "react";
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
  const [status, setStatus] = useState(initialStatus);
  
  // جلب الحالة الحديثة عند التحميل والتحديث عند كل تغيير
  useEffect(() => {
    if (!ideaId) return;
    
    // وظيفة لجلب حالة الفكرة من قاعدة البيانات
    const fetchCurrentStatus = async () => {
      try {
        console.log("🔍 جلب حالة الفكرة الحالية:", ideaId);
        const { data, error } = await supabase
          .from('ideas')
          .select('status')
          .eq('id', ideaId)
          .single();
          
        if (error) {
          console.error("⚠️ خطأ في جلب حالة الفكرة:", error);
          return;
        }
        
        if (data && data.status) {
          console.log(`📊 حالة الفكرة المستلمة من قاعدة البيانات: "${data.status}"`);
          
          // تحديث الحالة فقط إذا كانت مختلفة
          if (data.status !== status) {
            console.log(`🔄 تحديث حالة الفكرة في واجهة المستخدم من "${status}" إلى "${data.status}"`);
            setStatus(data.status);
            
            // عرض إشعار إذا كانت الحالة "بانتظار القرار"
            if (data.status === "pending_decision") {
              toast.info("الفكرة الآن بانتظار القرار", { duration: 3000 });
            }
          } else {
            console.log(`ℹ️ الحالة الحالية مطابقة للحالة في قاعدة البيانات: "${status}"`);
          }
        }
      } catch (err) {
        console.error("⚠️ خطأ غير متوقع أثناء جلب حالة الفكرة:", err);
      }
    };

    // جلب الحالة فوراً عند تحميل المكون
    console.log("🏁 بدء تحميل مكون StatusBadge مع الحالة الأولية:", initialStatus);
    fetchCurrentStatus();
    
    // إعداد قناة الاستماع للتغييرات في الوقت الحقيقي
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
          if (payload.new && payload.new.status) {
            const newStatus = payload.new.status;
            console.log(`📢 تم استلام تحديث حالة جديد من قاعدة البيانات: "${newStatus}"`);
            
            // تحديث الحالة في واجهة المستخدم
            setStatus(newStatus);
            
            // عرض إشعار عند تغيير الحالة
            if (newStatus === "pending_decision") {
              toast.info("الفكرة الآن بانتظار القرار", { duration: 3000 });
            } else if (newStatus === "approved") {
              toast.success("تمت الموافقة على الفكرة", { duration: 3000 });
            } else if (newStatus === "rejected") {
              toast.error("تم رفض الفكرة", { duration: 3000 });
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
  }, [ideaId, status]);

  // سجل معلومات العرض للتصحيح
  console.log(`🏷️ عرض الحالة: "${status}" (${typeof status})`);
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
      {getStatusDisplay(status)}
    </span>
  );
};
