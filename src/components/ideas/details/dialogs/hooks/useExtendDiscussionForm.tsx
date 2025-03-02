
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTimeRemaining, extractTotalHours } from "../../utils/countdownUtils";

export interface ExtendDiscussionFormState {
  days: number;
  hours: number;
  isSubmitting: boolean;
  remainingDays: number;
  remainingHours: number;
  isLoading: boolean;
  operation: string;
  totalCurrentHours: number;
}

export interface UseExtendDiscussionFormProps {
  ideaId: string;
  onSuccess: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export const useExtendDiscussionForm = ({
  ideaId,
  onSuccess,
  onClose,
  isOpen,
}: UseExtendDiscussionFormProps) => {
  const [formState, setFormState] = useState<ExtendDiscussionFormState>({
    days: 0,
    hours: 0,
    isSubmitting: false,
    remainingDays: 0,
    remainingHours: 0,
    isLoading: true,
    operation: "add",
    totalCurrentHours: 0,
  });

  // استرجاع معلومات الفكرة والوقت المتبقي عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      const fetchIdeaDetails = async () => {
        setFormState(prev => ({ ...prev, isLoading: true }));
        try {
          const { data: ideaData, error: fetchError } = await supabase
            .from("ideas")
            .select("discussion_period, created_at")
            .eq("id", ideaId)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          console.log("Idea data fetched:", ideaData);

          if (ideaData) {
            // حساب الوقت المتبقي
            const { discussion_period, created_at } = ideaData;
            
            if (discussion_period && created_at) {
              console.log("Discussion period from DB:", discussion_period);
              console.log("Created at from DB:", created_at);
              
              // استخدام الدالة الجديدة لاستخراج إجمالي الساعات
              const totalHours = extractTotalHours(discussion_period);
              
              // حساب الوقت المتبقي بالساعات
              const timeRemaining = calculateTimeRemaining(discussion_period, created_at);
              
              // تحويل الوقت المتبقي إلى أيام وساعات
              const totalHoursRemaining = 
                (timeRemaining.days * 24) + 
                timeRemaining.hours + 
                (timeRemaining.minutes / 60) + 
                (timeRemaining.seconds / 3600);
              
              const remaining_days = Math.floor(totalHoursRemaining / 24);
              const remaining_hours = Math.floor(totalHoursRemaining % 24);
              
              console.log("Calculated remaining time:", { days: remaining_days, hours: remaining_hours });
              console.log("Total current hours in period:", totalHours);
              
              // إعداد القيم الأولية في حقول الإدخال بناءً على الوقت الحالي
              let initialDays = 0;
              let initialHours = 0;
              
              if (totalHours >= 24) {
                initialDays = Math.floor(totalHours / 24);
                initialHours = Math.floor(totalHours % 24);
              } else {
                initialDays = 0;
                initialHours = Math.floor(totalHours);
              }

              setFormState(prev => ({
                ...prev,
                days: initialDays,
                hours: initialHours,
                remainingDays: remaining_days,
                remainingHours: remaining_hours,
                totalCurrentHours: totalHours,
                isLoading: false
              }));
            }
          }
        } catch (error) {
          console.error("Error fetching idea details:", error);
          toast.error("حدث خطأ أثناء تحميل بيانات الفكرة");
          setFormState(prev => ({ ...prev, isLoading: false }));
        }
      };

      fetchIdeaDetails();
    }
  }, [isOpen, ideaId]);

  const handleDaysChange = (value: number) => {
    setFormState(prev => ({ ...prev, days: value }));
  };

  const handleHoursChange = (value: number) => {
    setFormState(prev => ({ ...prev, hours: value }));
  };

  const handleOperationChange = (value: string) => {
    setFormState(prev => ({ ...prev, operation: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formState.days === 0 && formState.hours === 0) {
      toast.error("يرجى تحديد وقت للتعديل");
      return;
    }
    
    if (formState.operation === "subtract" && (formState.days > formState.remainingDays || 
       (formState.days === formState.remainingDays && formState.hours > formState.remainingHours))) {
      toast.error("لا يمكن تنقيص وقت أكثر من الوقت المتبقي");
      return;
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // حساب إجمالي الساعات المقدمة من المستخدم
      const userInputHours = (formState.days * 24) + formState.hours;
      
      // حساب الساعات الجديدة بناءً على نوع العملية
      let newTotalHours = 0;
      
      if (formState.operation === "add") {
        // في حالة الإضافة، نضيف الساعات الجديدة إلى إجمالي الساعات الحالية
        newTotalHours = formState.totalCurrentHours + userInputHours;
      } else {
        // في حالة التنقيص، نطرح الساعات من إجمالي الساعات الحالية
        newTotalHours = Math.max(0, formState.totalCurrentHours - userInputHours);
      }

      console.log("Current total hours:", formState.totalCurrentHours);
      console.log("User input hours:", userInputHours);
      console.log("Operation:", formState.operation);
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
        .update({ discussion_period: newDiscussionPeriod })
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("Discussion period updated successfully");
      toast.success(formState.operation === "add" ? "تم تمديد فترة المناقشة بنجاح" : "تم تنقيص فترة المناقشة بنجاح");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error modifying discussion period:", error);
      toast.error("حدث خطأ أثناء تعديل فترة المناقشة");
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleEndDiscussion = async () => {
    setFormState(prev => ({ ...prev, isSubmitting: true }));
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
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    formState,
    handleDaysChange,
    handleHoursChange,
    handleOperationChange,
    handleSubmit,
    handleEndDiscussion
  };
};
