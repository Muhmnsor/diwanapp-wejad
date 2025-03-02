
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IdeaUpdates } from "../types";
import { calculateNewDiscussionPeriod } from "./timeCalculationUtils";

interface SubmitDiscussionProps {
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

export const useSubmitDiscussion = ({
  ideaId,
  days,
  hours,
  operation,
  totalCurrentHours,
  remainingDays,
  remainingHours,
  onSuccess,
  onClose
}: SubmitDiscussionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);

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

  const prepareUpdates = async (newDiscussionPeriod: string, newTotalHours: number): Promise<IdeaUpdates> => {
    // Define updates object
    const updates: IdeaUpdates = { discussion_period: newDiscussionPeriod };
    
    // If extending time and status is pending_decision, change it back to draft
    if (operation === "add" && newTotalHours > 0) {
      // Check current idea status
      const { data: ideaStatus } = await supabase
        .from("ideas")
        .select("status")
        .eq("id", ideaId)
        .single();
      
      // If status is "pending_decision", change it back to "draft"
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
    
    // Call success callback to update UI
    onSuccess();
    
    // Close dialog
    onClose();
    
    // Brief delay before reloading page to ensure dialog closes and changes apply
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
      // Calculate new discussion period
      const newDiscussionPeriod = calculateNewDiscussionPeriod(
        days,
        hours,
        operation,
        totalCurrentHours
      );
      console.log("New discussion period:", newDiscussionPeriod);

      // Calculate user input hours for updates
      const userInputHours = (days * 24) + hours;
      const newTotalHours = operation === "add" 
        ? totalCurrentHours + userInputHours
        : Math.max(0, totalCurrentHours - userInputHours);

      // Prepare updates
      const updates = await prepareUpdates(newDiscussionPeriod, newTotalHours);

      // Update database
      await updateDatabase(updates);

      // Complete operation
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
      // Update discussion period to zero hours to end it and update status to pending_decision
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
    isSubmitting,
    isEndDialogOpen,
    setIsEndDialogOpen,
    handleSubmit,
    handleEndDiscussion
  };
};
