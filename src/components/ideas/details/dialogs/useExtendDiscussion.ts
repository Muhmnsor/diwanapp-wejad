
import { useState } from "react";
import { useFetchIdeaData } from "./useExtendDiscussion/useFetchIdeaData";
import { useSubmitDiscussion } from "./useExtendDiscussion/useSubmitDiscussion";

export const useExtendDiscussion = (
  isOpen: boolean,
  ideaId: string,
  onSuccess: () => void,
  onClose: () => void
) => {
  // Form state
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [operation, setOperation] = useState<string>("add");

  // Data fetching hook
  const { 
    isLoading, 
    remainingDays, 
    remainingHours, 
    totalCurrentHours 
  } = useFetchIdeaData(isOpen, ideaId, setDays, setHours);

  // Submission hook
  const {
    isSubmitting,
    isEndDialogOpen,
    setIsEndDialogOpen,
    handleSubmit,
    handleEndDiscussion
  } = useSubmitDiscussion({
    ideaId,
    days,
    hours,
    operation,
    totalCurrentHours,
    remainingDays,
    remainingHours,
    onSuccess,
    onClose
  });

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
