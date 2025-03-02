
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DiscussionPeriodData, ExtendFormData } from "../types";
import { calculateNewTotalHours, formatDiscussionPeriod } from "../utils/discussionPeriodUtils";

export const useDiscussionSubmit = (
  ideaId: string,
  discussionData: DiscussionPeriodData,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  const validateSubmission = (formData: ExtendFormData): string | null => {
    const { days, hours, operation } = formData;
    const { remainingDays, remainingHours } = discussionData;
    
    if (days === 0 && hours === 0) {
      return "يرجى تحديد وقت للتعديل";
    }
    
    if (
      operation === "subtract" && 
      (days > remainingDays || (days === remainingDays && hours > remainingHours))
    ) {
      return "لا يمكن تنقيص وقت أكثر من الوقت المتبقي";
    }
    
    return null;
  };

  const handleSubmit = async (formData: ExtendFormData) => {
    const validationError = validateSubmission(formData);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const { days, hours, operation } = formData;
      
      // حساب إجمالي الساعات المقدمة من المستخدم
      const userInputHours = (days * 24) + hours;
      
      // حساب الساعات الجديدة بناءً على نوع العملية
      const newTotalHours = calculateNewTotalHours(
        discussionData.totalCurrentHours,
        userInputHours,
        operation
      );

      console.log("Current total hours:", discussionData.totalCurrentHours);
      console.log("User input hours:", userInputHours);
      console.log("Operation:", operation);
      console.log("New total hours:", newTotalHours);
      
      // صياغة فترة المناقشة الجديدة بالشكل الصحيح
      const newDiscussionPeriod = formatDiscussionPeriod(newTotalHours);
      
      console.log("New discussion period:", newDiscussionPeriod);

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ discussion_period: newDiscussionPeriod })
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
      // تحديث فترة المناقشة إلى صفر ساعات لإنهائها
      const { error: updateError } = await supabase
        .from("ideas")
        .update({ discussion_period: "0 hours" })
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
