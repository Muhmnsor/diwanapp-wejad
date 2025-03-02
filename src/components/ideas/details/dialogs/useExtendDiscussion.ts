
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTimeRemaining } from "../utils/countdownUtils";

export const useExtendDiscussion = (
  isOpen: boolean,
  ideaId: string,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [remainingHours, setRemainingHours] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [operation, setOperation] = useState<string>("add");
  const [totalCurrentHours, setTotalCurrentHours] = useState<number>(0);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

  // استرجاع معلومات الفكرة والوقت المتبقي عند فتح النافذة
  useEffect(() => {
    if (isOpen) {
      fetchIdeaDetails();
    }
  }, [isOpen, ideaId]);

  const fetchIdeaDetails = async () => {
    setIsLoading(true);
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
          
          // حساب إجمالي الساعات الحالية
          let totalHours = 0;
          
          if (discussion_period.includes('hours') || discussion_period.includes('hour')) {
            const match = discussion_period.match(/(\d+)\s+hour/);
            if (match) {
              totalHours = parseInt(match[1]);
            }
          } else if (discussion_period.includes('days') || discussion_period.includes('day')) {
            const match = discussion_period.match(/(\d+)\s+day/);
            if (match) {
              totalHours = parseInt(match[1]) * 24;
            }
          } else {
            totalHours = parseFloat(discussion_period);
          }
          
          setTotalCurrentHours(totalHours);
          
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
          
          setRemainingDays(remaining_days);
          setRemainingHours(remaining_hours);
          
          // إعداد القيم الأولية في حقول الإدخال بناءً على الوقت الحالي
          if (totalHours >= 24) {
            const currentDays = Math.floor(totalHours / 24);
            const currentHoursRemainder = totalHours % 24;
            setDays(currentDays);
            setHours(currentHoursRemainder);
          } else {
            setDays(0);
            setHours(totalHours);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching idea details:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الفكرة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      // تعريف نوع كائن التحديثات لتجنب خطأ TypeScript
      const updates: {
        discussion_period: string;
        status?: string;
      } = { discussion_period: newDiscussionPeriod };
      
      // إذا كان التمديد (إضافة وقت) وكانت الحالة منتهية، نعيد الحالة إلى draft
      if (operation === "add" && newTotalHours > 0) {
        // تحقق من حالة الفكرة الحالية
        const { data: ideaStatus } = await supabase
          .from("ideas")
          .select("status")
          .eq("id", ideaId)
          .single();
        
        // إذا كانت الحالة "pending_decision" (بانتظار القرار)، نعيدها إلى "draft" (قيد المناقشة)
        if (ideaStatus && ideaStatus.status === "pending_decision") {
          updates.status = "draft";
        }
      }

      // تحديث قاعدة البيانات بالقيم الجديدة
      const { error: updateError } = await supabase
        .from("ideas")
        .update(updates)
        .eq("id", ideaId);

      if (updateError) {
        throw updateError;
      }

      console.log("Discussion period updated successfully");
      toast.success(operation === "add" ? "تم تمديد فترة المناقشة بنجاح" : "تم تنقيص فترة المناقشة بنجاح");
      
      // استدعاء دالة النجاح لتحديث الواجهة
      onSuccess();
      
      // إغلاق نافذة الحوار
      onClose();
      
      // تأخير قصير قبل إعادة تحميل الصفحة للتأكد من إغلاق نافذة الحوار وتطبيق التغييرات
      setTimeout(() => {
        window.location.reload();
      }, 300);
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
      // تحديث فترة المناقشة إلى صفر ساعات لإنهائها وتحديث الحالة إلى بانتظار القرار
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
      
      // استدعاء دالة النجاح لتحديث الواجهة
      onSuccess();
      
      // إغلاق نافذة الحوار
      onClose();
      
      // تأخير قصير قبل إعادة تحميل الصفحة
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("Error ending discussion:", error);
      toast.error("حدث خطأ أثناء إنهاء المناقشة");
    } finally {
      setIsSubmitting(false);
      setIsEndDialogOpen(false);
    }
  };

  return {
    days,
    setDays,
    hours, 
    setHours,
    remainingDays,
    remainingHours,
    totalCurrentHours,
    operation,
    setOperation,
    isLoading,
    isSubmitting,
    isEndDialogOpen,
    setIsEndDialogOpen,
    handleSubmit,
    handleEndDiscussion
  };
};
