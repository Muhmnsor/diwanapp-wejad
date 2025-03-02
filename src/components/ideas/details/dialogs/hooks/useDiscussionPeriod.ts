
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { calculateTimeRemaining } from "../../utils/countdownUtils";
import { toast } from "sonner";

export const useDiscussionPeriod = (isOpen: boolean, ideaId: string) => {
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [remainingHours, setRemainingHours] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [operation, setOperation] = useState<string>("add");
  const [totalCurrentHours, setTotalCurrentHours] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
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
              
              // حساب إجمالي الساعات الحالية بشكل دقيق من فترة المناقشة
              let totalHours = 0;
              
              if (discussion_period.includes('days') || discussion_period.includes('day')) {
                const daysMatch = discussion_period.match(/(\d+)\s+day/);
                if (daysMatch) {
                  totalHours += parseInt(daysMatch[1]) * 24;
                }
              }
              
              if (discussion_period.includes('hours') || discussion_period.includes('hour')) {
                const hoursMatch = discussion_period.match(/(\d+)\s+hour/);
                if (hoursMatch) {
                  totalHours += parseInt(hoursMatch[1]);
                }
              }
              
              if (totalHours === 0 && !isNaN(parseFloat(discussion_period))) {
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

      fetchIdeaDetails();
    }
  }, [isOpen, ideaId]);

  return {
    days,
    setDays,
    hours,
    setHours,
    remainingDays,
    remainingHours,
    isLoading,
    operation,
    setOperation,
    totalCurrentHours
  };
};
