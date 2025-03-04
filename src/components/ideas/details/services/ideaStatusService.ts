
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Fetches the current status of an idea from the database
 */
export const fetchIdeaStatus = async (ideaId?: string) => {
  try {
    console.log("🔍 جلب حالة الفكرة الحالية:", ideaId);
    const { data, error } = await supabase
      .from('ideas')
      .select('status, discussion_period, created_at')
      .eq('id', ideaId)
      .maybeSingle();
      
    if (error) {
      console.error("⚠️ خطأ في جلب حالة الفكرة:", error);
      return null;
    }
    
    console.log(`📊 بيانات الفكرة المستلمة من قاعدة البيانات:`, data);
    return data;
  } catch (err) {
    console.error("⚠️ خطأ غير متوقع أثناء جلب حالة الفكرة:", err);
    return null;
  }
};

/**
 * Updates an idea's status in the database
 */
export const updateIdeaStatus = async (ideaId?: string, newStatus?: string) => {
  if (!ideaId || !newStatus) {
    console.log("⚠️ لا يمكن تحديث الحالة: معرف الفكرة أو الحالة الجديدة غير محددة");
    return false;
  }
  
  try {
    console.log(`🔄 تحديث حالة الفكرة في قاعدة البيانات إلى "${newStatus}"`);
    
    const { error } = await supabase
      .from('ideas')
      .update({ status: newStatus })
      .eq('id', ideaId);
        
    if (error) {
      console.error("⚠️ خطأ في تحديث حالة الفكرة:", error);
      return false;
    }
    
    console.log(`✅ تم تحديث حالة الفكرة بنجاح إلى "${newStatus}"`);
    
    // عرض إشعار مناسب
    if (newStatus === "pending_decision") {
      toast.info("تم تحديث حالة الفكرة إلى: بانتظار القرار", { duration: 3000 });
    } else if (newStatus === "under_review") {
      toast.info("تم تحديث حالة الفكرة إلى: قيد المناقشة", { duration: 3000 });
    }
    
    return true;
  } catch (err) {
    console.error("⚠️ خطأ غير متوقع عند تحديث حالة الفكرة:", err);
    return false;
  }
};
