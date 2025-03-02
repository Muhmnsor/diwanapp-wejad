
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTimeRemaining } from "../utils/countdownUtils";
import { IdeaUpdates } from "./types";

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
        processFetchedIdeaData(ideaData);
      }
    } catch (error) {
      console.error("Error fetching idea details:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الفكرة");
    } finally {
      setIsLoading(false);
    }
  };

  const processFetchedIdeaData = (ideaData: { discussion_period: string, created_at: string }) => {
    const { discussion_period, created_at } = ideaData;
    
    if (discussion_period && created_at) {
      console.log("Discussion period from DB:", discussion_period);
      console.log("Created at from DB:", created_at);
      
      // حساب إجمالي الساعات الحالية
      const totalHours = calculateTotalHours(discussion_period);
      setTotalCurrentHours(totalHours);
      
      // حساب الوقت المتبقي بالساعات
      const timeRemaining = calculateTimeRemaining(discussion_period, created_at);
      
      // تحويل الوقت المتبقي إلى أيام وساعات
      const { days: remaining_days, hours: remaining_hours } = calculateRemainingTime(timeRemaining);
      
      console.log("Calculated remaining time:", { days: remaining_days, hours: remaining_hours });
      console.log("Total current hours in period:", totalHours);
      
      setRemainingDays(remaining_days);
      setRemainingHours(remaining_hours);
      
      // إعداد القيم الأولية في حقول الإدخال بناءً على الوقت الحالي
      setInitialInputValues(totalHours);
    }
  };

  const calculateTotalHours = (discussionPeriod: string): number => {
    let totalHours = 0;
    
    if (discussionPeriod.includes('hours') || discussionPeriod.includes('hour')) {
      const match = discussionPeriod.match(/(\d+)\s+hour/);
      if (match) {
        totalHours = parseInt(match[1]);
      }
    } else if (discussionPeriod.includes('days') || discussionPeriod.includes('day')) {
      const match = discussionPeriod.match(/(\d+)\s+day/);
      if (match) {
        totalHours = parseInt(match[1]) * 24;
      }
    } else {
      totalHours = parseFloat(discussionPeriod);
    }
    
    return totalHours;
  };

  const calculateRemainingTime = (timeRemaining: { days: number; hours: number; minutes: number; seconds: number }) => {
    const totalHoursRemaining = 
      (timeRemaining.days * 24) + 
      timeRemaining.hours + 
      (timeRemaining.minutes / 60) + 
      (timeRemaining.seconds / 3600);
    
    const remaining_days = Math.floor(totalHoursRemaining / 24);
    const remaining_hours = Math.floor(totalHoursRemaining % 24);
    
    return { days: remaining_days, hours: remaining_hours };
  };

  const setInitialInputValues = (totalHours: number) => {
    if (totalHours >= 24) {
      const currentDays = Math.floor(totalHours / 24);
      const currentHoursRemainder = totalHours % 24;
      setDays(currentDays);
      setHours(currentHoursRemainder);
    } else {
      setDays(0);
      setHours(totalHours);
    }
  };

  const validateSubmission = (): boolean => {
    if (days === 0 && hours === 0) {
      toast.error("يرجى تحديد وقت للتعديل");
      return false;
    }
    
    if (operation === "subtract" && (days > remainingDays || (days === remainingDays && hours > remainingHours))) {
      toast.error("لا يمكن تنقيص وقت أكثر من الوقت المتبقي");
      return false;
    }
    
    return true;
  };

  const calculateNewDiscussionPeriod = (): string => {
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
    return formatDiscussionPeriod(newTotalHours);
  };

  const formatDiscussionPeriod = (totalHours: number): string => {
    const finalDays = Math.floor(totalHours / 24);
    const finalHours = Math.floor(totalHours % 24);
    
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
    
    return newDiscussionPeriod;
  };

  const prepareUpdates = async (newDiscussionPeriod: string, newTotalHours: number): Promise<IdeaUpdates> => {
    // تعريف كائن التحديثات
    const updates: IdeaUpdates = { discussion_period: newDiscussionPeriod };
    
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

    return updates;
  };

  const updateDatabase = async (updates: IdeaUpdates): Promise<void> => {
    const { error: updateError } = await supabase
      .from("ideas")
      .update(updates)
      .eq("id", ideaId);

    if (updateError) {
      throw updateError;
    }
  };

  const completeOperation = (operationMessage: string) => {
    console.log(operationMessage);
    toast.success(operationMessage);
    
    // استدعاء دالة النجاح لتحديث الواجهة
    onSuccess();
    
    // إغلاق نافذة الحوار
    onClose();
    
    // تأخير قصير قبل إعادة تحميل الصفحة للتأكد من إغلاق نافذة الحوار وتطبيق التغييرات
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const newDiscussionPeriod = calculateNewDiscussionPeriod();
      console.log("New discussion period:", newDiscussionPeriod);

      // حساب الساعات الجديدة
      const userInputHours = (days * 24) + hours;
      const newTotalHours = operation === "add" 
        ? totalCurrentHours + userInputHours
        : Math.max(0, totalCurrentHours - userInputHours);

      // تجهيز التحديثات
      const updates = await prepareUpdates(newDiscussionPeriod, newTotalHours);

      // تحديث قاعدة البيانات
      await updateDatabase(updates);

      // إكمال العملية
      const successMessage = operation === "add" 
        ? "تم تمديد فترة المناقشة بنجاح" 
        : "تم تنقيص فترة المناقشة بنجاح";
      
      completeOperation(successMessage);
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
      const updates: IdeaUpdates = { 
        discussion_period: "0 hours",
        status: "pending_decision" 
      };

      await updateDatabase(updates);
      completeOperation("تم إنهاء المناقشة بنجاح");
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
