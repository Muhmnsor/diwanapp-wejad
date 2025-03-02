
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
      // تحديث فترة المناقشة إلى صفر ساعات لإنهائها وتغيير الحالة إلى "pending_decision"
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ 
          discussion_period: "0 hours",
          status: "pending_decision" 
        })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("Discussion ended successfully");
      toast.success("تم إنهاء المناقشة بنجاح");
      onSuccess();
      onClose();
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
