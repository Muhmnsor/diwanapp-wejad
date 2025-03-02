
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTimeRemaining } from "../../utils/countdownUtils";
import { DiscussionPeriodData } from "../types";

export const useIdeaDiscussionData = (ideaId: string, isOpen: boolean) => {
  const [discussionData, setDiscussionData] = useState<DiscussionPeriodData>({
    remainingDays: 0,
    remainingHours: 0,
    totalCurrentHours: 0,
    discussionEnded: false,
    createdAt: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    days: 0,
    hours: 0,
    operation: "add" as "add" | "subtract"
  });

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
              
              // التحقق مما إذا كانت المناقشة منتهية بالفعل (صفر ساعات)
              if (discussion_period === "0 hours") {
                setDiscussionData({
                  discussionPeriod: discussion_period,
                  createdAt: created_at,
                  remainingDays: 0,
                  remainingHours: 0,
                  totalCurrentHours: 0,
                  discussionEnded: true
                });
              } else {
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
                
                // تحقق إذا كان الوقت المتبقي صفر (المناقشة انتهت)
                const isEnded = totalHoursRemaining <= 0;
                
                // إعداد القيم الأولية في حقول الإدخال بناءً على الوقت الحالي
                let initialDays = 0;
                let initialHours = 0;

                if (totalHours >= 24) {
                  initialDays = Math.floor(totalHours / 24);
                  initialHours = totalHours % 24;
                } else {
                  initialHours = totalHours;
                }

                setFormData({
                  days: initialDays,
                  hours: initialHours,
                  operation: "add"
                });
                
                setDiscussionData({
                  discussionPeriod: discussion_period,
                  createdAt: created_at,
                  remainingDays: remaining_days,
                  remainingHours: remaining_hours,
                  totalCurrentHours: totalHours,
                  discussionEnded: isEnded
                });
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
    discussionData, 
    isLoading, 
    formData,
    setFormData
  };
};
