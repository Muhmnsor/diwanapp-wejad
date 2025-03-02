
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateNewDiscussionPeriod } from "./timeUtils";

export const useDiscussionSubmit = (
  ideaId: string,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
    days: number,
    hours: number,
    operation: string,
    totalCurrentHours: number,
    remainingDays: number,
    remainingHours: number
  ) => {
    e.preventDefault();
    
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
      
      const newDiscussionPeriod = calculateNewDiscussionPeriod(
        operation, 
        totalCurrentHours, 
        userInputHours
      );

      // التحقق من حالة المناقشة للتحديث المناسب
      let newStatus = undefined;
      
      // إذا كانت العملية إضافة
      if (operation === "add") {
        // إذا كان الوقت المتبقي صفر (المناقشة منتهية)، نعيد الحالة إلى "قيد المناقشة"
        if (remainingDays === 0 && remainingHours === 0) {
          newStatus = "under_review";
          console.log("إعادة تفعيل المناقشة - الحالة الجديدة:", newStatus);
        }
      } 
      // إذا كانت العملية طرح وأصبح الوقت المتبقي صفرًا
      else if (operation === "subtract") {
        const newRemainingHours = totalCurrentHours - userInputHours;
        if (newRemainingHours <= 0) {
          newStatus = "pending_decision";
          console.log("انتهاء المناقشة بعد الطرح - الحالة الجديدة:", newStatus);
        }
      }

      // تحديث قاعدة البيانات بشكل صريح مع تحديد الحالة
      console.log("تحديث فترة المناقشة وحالة الفكرة:", {
        discussion_period: newDiscussionPeriod,
        status: newStatus
      });
      
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ 
          discussion_period: newDiscussionPeriod,
          status: newStatus // إما under_review, pending_decision، أو undefined إذا لم يتغير
        })
        .eq("id", ideaId);

      if (updateError) {
        console.error("خطأ في تحديث بيانات الفكرة:", updateError);
        throw updateError;
      }

      console.log("Discussion period updated successfully with status:", newStatus || "unchanged");
      toast.success(operation === "add" ? "تم تمديد فترة المناقشة بنجاح" : "تم تنقيص فترة المناقشة بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error modifying discussion period:", error);
      toast.error("حدث خطأ أثناء تعديل فترة المناقشة");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndDiscussion = async () => {
    setIsSubmitting(true);
    try {
      console.log("إنهاء المناقشة وتغيير الحالة إلى pending_decision");
      
      // إضافة تأخير قصير قبل الطلب لتجنب مشاكل التوقيت
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
        console.error("خطأ في إنهاء المناقشة:", updateError);
        throw updateError;
      }

      console.log("تم إنهاء المناقشة بنجاح:", data);
      toast.success("تم إنهاء المناقشة بنجاح");
      
      // انتظار لحظة قبل إغلاق النافذة للتأكد من تحديث الحالة
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 300);
    } catch (error) {
      console.error("Error ending discussion:", error);
      toast.error("حدث خطأ أثناء إنهاء المناقشة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
    handleEndDiscussion
  };
};
