
import React, { useEffect, useState } from "react";
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isDiscussionActive } from "../utils/countdownUtils";

interface StatusBadgeProps {
  status: string;
  ideaId?: string;
  discussionPeriod?: string;
  createdAt?: string;
}

export const StatusBadge = ({ 
  status: initialStatus,
  ideaId,
  discussionPeriod,
  createdAt
}: StatusBadgeProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [lastStatusUpdate, setLastStatusUpdate] = useState<number>(Date.now());
  const [isProcessingStatusChange, setIsProcessingStatusChange] = useState(false);
  
  // التحقق من حالة المناقشة والتحديث عند الحاجة
  useEffect(() => {
    if (!ideaId) return;
    
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
          if (payload.new) {
            const newData = payload.new as any;
            console.log(`📢 تم استلام تحديث من قاعدة البيانات:`, newData);
            
            // تحديث الحالة في واجهة المستخدم إذا تغيرت
            if (newData.status && newData.status !== status) {
              console.log(`🔄 تحديث الحالة من "${status}" إلى "${newData.status}"`);
              setStatus(newData.status);
              setLastStatusUpdate(Date.now());
              
              // عرض إشعار عند تغيير الحالة
              if (newData.status === "pending_decision") {
                toast.info("الفكرة الآن بانتظار القرار", { duration: 3000 });
              } else if (newData.status === "approved") {
                toast.success("تمت الموافقة على الفكرة", { duration: 3000 });
              } else if (newData.status === "rejected") {
                toast.error("تم رفض الفكرة", { duration: 3000 });
              } else if (newData.status === "under_review" || newData.status === "draft") {
                toast.info("الفكرة الآن قيد المناقشة", { duration: 3000 });
              }
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
  }, [ideaId, initialStatus]);

  // وظيفة منفصلة للتحقق من حالة المناقشة تعمل مرة واحدة فقط عند تغير البيانات
  useEffect(() => {
    if (!ideaId || !discussionPeriod || !createdAt) return;

    // منع تنفيذ التحقق إذا تم تحديث الحالة مؤخراً (خلال 5 ثوان)
    if (Date.now() - lastStatusUpdate < 5000) {
      console.log("⏱️ تم تحديث الحالة مؤخراً، تجاهل التحقق من حالة المناقشة");
      return;
    }

    if (isProcessingStatusChange) {
      console.log("⏳ جاري معالجة تغيير الحالة بالفعل، تجاهل التحقق الإضافي");
      return;
    }

    const checkDiscussionStatus = async () => {
      try {
        const isActive = isDiscussionActive(discussionPeriod, createdAt);
        console.log(`🔍 التحقق من حالة المناقشة. نشطة: ${isActive}, فترة المناقشة: ${discussionPeriod}`);
        
        setIsProcessingStatusChange(true);
        
        // إذا كانت الفكرة في مرحلة المناقشة (draft/under_review) وانتهت المناقشة
        if (!isActive && (status === 'draft' || status === 'under_review')) {
          console.log("⏰ انتهت المناقشة، تحديث الحالة إلى بانتظار القرار");
          
          await updateIdeaStatus('pending_decision');
        } 
        // إذا كانت الفكرة في حالة انتظار القرار وتم تمديد المناقشة (أصبحت نشطة مرة أخرى)
        else if (isActive && status === 'pending_decision') {
          console.log("⏰ تم تمديد فترة المناقشة، تحديث الحالة إلى قيد المناقشة");
          
          await updateIdeaStatus('under_review');
        }
      } finally {
        setIsProcessingStatusChange(false);
      }
    };
    
    // نفذ التحقق عند تحميل المكون أو تغير البيانات
    checkDiscussionStatus();
  }, [discussionPeriod, createdAt, status, ideaId, lastStatusUpdate]);

  // وظيفة لجلب حالة الفكرة من قاعدة البيانات
  const fetchCurrentStatus = async () => {
    try {
      console.log("🔍 جلب حالة الفكرة الحالية:", ideaId);
      const { data, error } = await supabase
        .from('ideas')
        .select('status, discussion_period, created_at')
        .eq('id', ideaId)
        .maybeSingle();
        
      if (error) {
        console.error("⚠️ خطأ في جلب حالة الفكرة:", error);
        return;
      }
      
      if (data) {
        console.log(`📊 بيانات الفكرة المستلمة من قاعدة البيانات:`, data);
        
        // تحديث الحالة فقط إذا كانت مختلفة
        if (data.status !== status) {
          console.log(`🔄 تحديث حالة الفكرة في واجهة المستخدم من "${status}" إلى "${data.status}"`);
          setStatus(data.status);
          setLastStatusUpdate(Date.now());
          
          // عرض إشعار عند تغيير الحالة
          if (data.status === "pending_decision") {
            toast.info("الفكرة الآن بانتظار القرار", { duration: 3000 });
          } else if (data.status === "approved") {
            toast.success("تمت الموافقة على الفكرة", { duration: 3000 });
          } else if (data.status === "rejected") {
            toast.error("تم رفض الفكرة", { duration: 3000 });
          } else if (data.status === "under_review" || data.status === "draft") {
            toast.info("الفكرة الآن قيد المناقشة", { duration: 3000 });
          }
        }
      }
    } catch (err) {
      console.error("⚠️ خطأ غير متوقع أثناء جلب حالة الفكرة:", err);
    }
  };
  
  // وظيفة لتحديث حالة الفكرة في قاعدة البيانات
  const updateIdeaStatus = async (newStatus: string) => {
    if (newStatus === status) {
      console.log(`⏩ تجاهل التحديث: الحالة الجديدة "${newStatus}" مطابقة للحالة الحالية`);
      return;
    }
    
    try {
      console.log(`🔄 تحديث حالة الفكرة في قاعدة البيانات إلى "${newStatus}"`);
      
      const { error } = await supabase
        .from('ideas')
        .update({ status: newStatus })
        .eq('id', ideaId);
          
      if (error) {
        console.error("⚠️ خطأ في تحديث حالة الفكرة:", error);
        return;
      }
      
      console.log(`✅ تم تحديث حالة الفكرة بنجاح إلى "${newStatus}"`);
      setStatus(newStatus);
      setLastStatusUpdate(Date.now());
      
      // عرض إشعار مناسب
      if (newStatus === "pending_decision") {
        toast.info("تم تحديث حالة الفكرة إلى: بانتظار القرار", { duration: 3000 });
      } else if (newStatus === "under_review") {
        toast.info("تم تحديث حالة الفكرة إلى: قيد المناقشة", { duration: 3000 });
      }
    } catch (err) {
      console.error("⚠️ خطأ غير متوقع عند تحديث حالة الفكرة:", err);
    }
  };

  // سجل معلومات العرض للتصحيح
  console.log(`🏷️ عرض الحالة: "${status}" (${typeof status})`);
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
      {getStatusDisplay(status)}
    </span>
  );
};
