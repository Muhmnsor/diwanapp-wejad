
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

  // Let's simplify and pass only the props that are likely to be expected
  // based on naming conventions and common dialog patterns
  return (
    <ExtendDiscussionDialog
      isOpen={isOpen}
      onClose={onClose}
      ideaId={ideaId}
      onSubmit={async (data: any) => {
        // Set our local state based on the dialog's form data
        if (data.days !== undefined) setDays(data.days);
        if (data.hours !== undefined) setHours(data.hours);
        
        // Then call our extension logic
        return await handleExtendDiscussion();
      }}
      isSubmitting={isSubmitting}
    />
  );
};
