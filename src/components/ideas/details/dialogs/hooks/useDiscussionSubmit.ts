
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModifyDiscussionParams {
  ideaId: string;
  days: number;
  hours: number;
  operation: string;
  totalCurrentHours: number;
  remainingDays: number;
  remainingHours: number;
  onSuccess: () => void;
  onClose: () => void;
}

export const useDiscussionSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  const handleSubmit = async ({
    ideaId,
    days,
    hours,
    operation,
    totalCurrentHours,
    remainingDays,
    remainingHours,
    onSuccess,
    onClose
  }: ModifyDiscussionParams) => {
    if (days === 0 && hours === 0) {
      toast.error("يرجى تحديد وقت للتعديل");
      return;
    }
    
    if (operation === "subtract" && (days > remainingDays || (days === remainingDays && hours > remainingHours))) {
      toast.error("لا يمكن تنقيص وقت أكثر من الوقت المتبقي");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // حساب إجمالي الساعات المقدمة من المستخدم
      const userInputHours = (days * 24) + hours;
      
      // حساب الساعات الجديدة بناءً على نوع العملية
      let newTotalHours = 0;
      
      if (operation === "add") {
        // في حالة الإضافة، نضيف الساعات الجديدة إلى إجمالي الساعات الحالية
        newTotalHours = totalCurrentHours + userInputHours;
      } else {
        // في حالة التنقيص، نطرح الساعات من إجمالي الساعات الحالية
        newTotalHours = Math.max(0, totalCurrentHours - userInputHours);
      }

      console.log("Current total hours:", totalCurrentHours);
      console.log("User input hours:", userInputHours);
      console.log("Operation:", operation);
      console.log("New total hours:", newTotalHours);
      
      // صياغة فترة المناقشة الجديدة بالشكل الصحيح
      const finalDays = Math.floor(newTotalHours / 24);
      const finalHours = Math.floor(newTotalHours % 24);
      
      const daysText = finalDays === 1 ? "day" : "days";
      const hoursText = finalHours === 1 ? "hour" : "hours";
      
      let newDiscussionPeriod = "";
      if (finalDays > 0) {
        newDiscussionPeriod += `${finalDays} ${daysText}`;
      }
      if (finalHours > 0) {
        if (newDiscussionPeriod) newDiscussionPeriod += " ";
        newDiscussionPeriod += `${finalHours} ${hoursText}`;
      }
      
      // إذا كانت الفترة فارغة (حالة خاصة) نضع قيمة افتراضية
      if (!newDiscussionPeriod) {
        newDiscussionPeriod = "0 hours";
      }
      
      console.log("New discussion period:", newDiscussionPeriod);

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ 
          discussion_period: newDiscussionPeriod,
          // إذا كانت العملية إضافة وكانت المناقشة منتهية، نعيد تفعيلها
          status: (operation === "add" && (remainingDays === 0 && remainingHours === 0)) ? "under_review" : undefined
        })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("Discussion period updated successfully");
      toast.success(operation === "add" ? "تم تمديد فترة المناقشة بنجاح" : "تم تنقيص فترة المناقشة بنجاح");
      
      // تأخير استدعاء دوال الإغلاق للسماح للنظام بمعالجة التحديثات
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error modifying discussion period:", error);
      toast.error("حدث خطأ أثناء تعديل فترة المناقشة");
      setIsSubmitting(false);
    }
  };

  const handleEndDiscussion = async (ideaId: string, onSuccess: () => void, onClose: () => void) => {
    setIsSubmitting(true);
    try {
      console.log("Starting end discussion process for idea:", ideaId);
      
      // التحقق من وجود الفكرة قبل تحديثها
      const { data: ideaExists, error: checkError } = await supabase
        .from("ideas")
        .select("id, status")
        .eq("id", ideaId)
        .single();
      
      if (checkError || !ideaExists) {
        console.error("Error checking idea existence:", checkError);
        toast.error("لم يتم العثور على الفكرة");
        setIsSubmitting(false);
        setIsEndDialogOpen(false);
        return;
      }
      
      console.log("Idea found, current status:", ideaExists.status);
      
      // تحديث فترة المناقشة إلى صفر ساعات لإنهائها وتغيير الحالة إلى "pending_decision"
      const { data, error: updateError } = await supabase
        .from("ideas")
        .update({ 
          discussion_period: "0 hours",
          status: "pending_decision" 
        })
        .eq("id", ideaId)
        .select();

      if (updateError) {
        console.error("Error updating idea status:", updateError);
        throw updateError;
      }

      console.log("Discussion ended successfully, updated data:", data);
      toast.success("تم إنهاء المناقشة بنجاح");
      
      // تأخير إغلاق نافذة التأكيد والنوافذ الأخرى للتأكد من اكتمال التحديثات أولاً
      setTimeout(() => {
        // إغلاق نافذة التأكيد أولاً
        setIsEndDialogOpen(false);
        
        // ثم استدعاء دالة النجاح
        onSuccess();
        
        // ثم إغلاق النافذة الرئيسية بعد فترة إضافية
        setTimeout(() => {
          onClose();
        }, 200);
      }, 500);
    } catch (error) {
      console.error("Error ending discussion:", error);
      toast.error("حدث خطأ أثناء إنهاء المناقشة");
      setIsSubmitting(false);
      setIsEndDialogOpen(false);
    }
  };

  return {
    isSubmitting,
    isEndDialogOpen,
    setIsEndDialogOpen,
    handleSubmit,
    handleEndDiscussion
  };
};
