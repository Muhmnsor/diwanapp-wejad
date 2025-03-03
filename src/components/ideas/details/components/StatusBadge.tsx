
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
  
  // التحقق من حالة المناقشة والتحديث عند الحاجة
  useEffect(() => {
    if (!ideaId) return;
    
    // التحقق من حالة النشاط للمناقشة إذا كانت البيانات متوفرة
    const checkDiscussionStatus = () => {
      if (discussionPeriod && createdAt) {
        const isActive = isDiscussionActive(discussionPeriod, createdAt);
        console.log(`🔍 التحقق من حالة المناقشة. نشطة: ${isActive}, فترة المناقشة: ${discussionPeriod}`);
        
        // إذا كانت الفكرة في مرحلة المناقشة (draft/under_review) وانتهت المناقشة
        if (!isActive && (status === 'draft' || status === 'under_review')) {
          console.log("⏰ انتهت المناقشة، تحديث الحالة إلى بانتظار القرار");
          
          // تحديث حالة الفكرة إلى بانتظار القرار
          updateIdeaStatus('pending_decision');
        } 
        // إذا كانت الفكرة في حالة انتظار القرار وتم تمديد المناقشة (أصبحت نشطة مرة أخرى)
        else if (isActive && status === 'pending_decision') {
          console.log("⏰ تم تمديد فترة المناقشة، تحديث الحالة إلى قيد المناقشة");
          
          // إعادة الفكرة إلى حالة المناقشة
          updateIdeaStatus('under_review');
        }
      }
    };
    
    // وظيفة لجلب حالة الفكرة من قاعدة البيانات
    const fetchCurrentStatus = async () => {
      try {
        console.log("🔍 جلب حالة الفكرة الحالية:", ideaId);
        const { data, error } = await supabase
          .from('ideas')
          .select('status, discussion_period, created_at')
          .eq('id', ideaId)
          .single();
          
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
          
          // التحقق من حالة المناقشة بناءً على البيانات المستلمة
          if (data.discussion_period && data.created_at) {
            const isActive = isDiscussionActive(data.discussion_period, data.created_at);
            console.log(`🔍 حالة المناقشة حسب البيانات المستلمة. نشطة: ${isActive}`);
          }
        }
      } catch (err) {
        console.error("⚠️ خطأ غير متوقع أثناء جلب حالة الفكرة:", err);
      }
    };
    
    // وظيفة لتحديث حالة الفكرة في قاعدة البيانات
    const updateIdeaStatus = async (newStatus: string) => {
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

    // جلب الحالة فوراً عند تحميل المكون
    console.log("🏁 بدء تحميل مكون StatusBadge مع الحالة الأولية:", initialStatus);
    fetchCurrentStatus();
    
    // التحقق من حالة المناقشة
    checkDiscussionStatus();
    
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
            
            // التحقق من حالة المناقشة بعد التحديث إذا تغيرت فترة المناقشة
            if (newData.discussion_period && newData.created_at) {
              const isActive = isDiscussionActive(newData.discussion_period, newData.created_at);
              console.log(`🔍 حالة المناقشة بعد التحديث. نشطة: ${isActive}`);
              
              // تحديث الحالة بناءً على نشاط المناقشة
              if (!isActive && (newData.status === 'draft' || newData.status === 'under_review')) {
                updateIdeaStatus('pending_decision');
              } else if (isActive && newData.status === 'pending_decision') {
                updateIdeaStatus('under_review');
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
  }, [ideaId, status, discussionPeriod, createdAt]);

  // سجل معلومات العرض للتصحيح
  console.log(`🏷️ عرض الحالة: "${status}" (${typeof status})`);
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusClass(status)}`}>
      {getStatusDisplay(status)}
    </span>
  );
};
