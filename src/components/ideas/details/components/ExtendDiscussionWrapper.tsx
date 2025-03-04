
import React from "react";
import { useDiscussionExtension } from "../hooks/useDiscussionExtension";
import { ExtendDiscussionDialog } from "../dialogs/ExtendDiscussionDialog";

interface ExtendDiscussionWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  ideaId: string;
  onSuccess?: () => void;
  currentDiscussionPeriod?: string;
  createdAt: string;
}

export const ExtendDiscussionWrapper: React.FC<ExtendDiscussionWrapperProps> = ({
  isOpen,
  onClose,
  ideaId,
  onSuccess,
  currentDiscussionPeriod,
  createdAt
}) => {
  const {
    days,
    setDays,
    hours,
    setHours,
    isSubmitting,
    handleExtendDiscussion
  } = useDiscussionExtension({
    ideaId,
    currentDiscussionPeriod,
    createdAt,
    onSuccess
  });

  // This function will be passed to the original dialog component
  const handleSubmit = async (formData: { days: number; hours: number }) => {
    // Update local state from form data
    setDays(formData.days);
    setHours(formData.hours);
    
    // Call our custom extension logic
    return handleExtendDiscussion();
  };

  return (
    <ExtendDiscussionDialog
      isOpen={isOpen}
      onClose={onClose}
      ideaId={ideaId}
      onSuccess={onSuccess}
      // Pass the customized submit handler
      // The dialog will call this with the form data
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};
