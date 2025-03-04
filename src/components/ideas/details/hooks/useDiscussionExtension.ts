
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateTimeRemaining } from "../utils/countdownUtils";

interface UseDiscussionExtensionProps {
  ideaId: string;
  currentDiscussionPeriod?: string;
  createdAt: string;
  onSuccess?: () => void;
}

export const useDiscussionExtension = ({
  ideaId,
  currentDiscussionPeriod,
  createdAt,
  onSuccess
}: UseDiscussionExtensionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);

  // Calculate if the discussion is expired
  const isExpired = () => {
    if (!currentDiscussionPeriod) return true;
    
    const timeRemaining = calculateTimeRemaining(currentDiscussionPeriod, createdAt);
    return (
      timeRemaining.days === 0 && 
      timeRemaining.hours === 0 && 
      timeRemaining.minutes === 0 && 
      timeRemaining.seconds === 0
    );
  };

  const handleExtendDiscussion = async () => {
    console.log("handleExtendDiscussion called with days:", days, "hours:", hours);
    
    if (days === 0 && hours === 0) {
      toast.error("الرجاء تحديد مدة زمنية للتمديد");
      return false;
    }

    setIsSubmitting(true);
    
    try {
      console.log("Extending discussion period", { 
        ideaId, 
        days, 
        hours, 
        currentPeriod: currentDiscussionPeriod,
        isExpired: isExpired()
      });

      // Format new discussion period
      let newDiscussionPeriod = "";
      if (days > 0) {
        newDiscussionPeriod += `${days} days `;
      }
      if (hours > 0) {
        newDiscussionPeriod += `${hours} hours`;
      }
      newDiscussionPeriod = newDiscussionPeriod.trim();

      console.log("New discussion period:", newDiscussionPeriod);

      // If discussion has already expired, we need to set a completely new period
      // starting from now, not extend the old one
      const { error } = await supabase
        .from('ideas')
        .update({ 
          discussion_period: newDiscussionPeriod,
          // If discussion is expired, update created_at to now so countdown starts fresh
          ...(isExpired() ? { created_at: new Date().toISOString() } : {})
        })
        .eq('id', ideaId);

      if (error) {
        console.error("Error extending discussion period:", error);
        throw error;
      }

      toast.success("تم تمديد فترة المناقشة بنجاح");
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setDays(0);
      setHours(0);
      
      return true;
    } catch (error) {
      console.error("Failed to extend discussion period:", error);
      toast.error("حدث خطأ أثناء تمديد فترة المناقشة");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    days,
    setDays,
    hours,
    setHours,
    isSubmitting,
    handleExtendDiscussion
  };
};
