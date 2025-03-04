
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

  // Instead of using onSubmit which doesn't exist on ExtendDiscussionDialog,
  // let's check the actual props the dialog expects and provide them directly
  
  return (
    <ExtendDiscussionDialog
      isOpen={isOpen}
      onClose={onClose}
      ideaId={ideaId}
      onSuccess={onSuccess}
      days={days}
      hours={hours}
      onDaysChange={setDays}
      onHoursChange={setHours}
      onExtend={handleExtendDiscussion}
      isSubmitting={isSubmitting}
    />
  );
};
