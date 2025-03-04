
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

  return (
    <ExtendDiscussionDialog
      isOpen={isOpen}
      onClose={onClose}
      ideaId={ideaId}
      onSuccess={onSuccess}
      // The dialog component doesn't take onSubmit directly
      // It has its own internal form submission handling
      // So we need to pass the state values and handlers separately
      // to integrate with its internal workings
      days={days}
      hours={hours}
      onDaysChange={setDays}
      onHoursChange={setHours}
      onExtend={handleExtendDiscussion}
      isSubmitting={isSubmitting}
    />
  );
};
