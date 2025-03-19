
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { CreateMeetingDialog } from "./CreateMeetingDialog";
import { useQueryClient } from "@tanstack/react-query";

interface MeetingDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  folderId?: string;
}

export const MeetingDialogWrapper = ({
  open,
  onOpenChange,
  onSuccess,
  folderId
}: MeetingDialogWrapperProps) => {
  const queryClient = useQueryClient();
  const { id: routeFolderId } = useParams<{ id: string }>();
  
  // Use either the prop folderId or the route parameter
  const effectiveFolderId = folderId || routeFolderId;
  
  // Wrap the original onSuccess to also invalidate folder-specific queries
  const handleSuccess = () => {
    if (effectiveFolderId) {
      queryClient.invalidateQueries({ queryKey: ['folder-meetings', effectiveFolderId] });
    }
    queryClient.invalidateQueries({ queryKey: ['meetings-count'] });
    
    // Call the original onSuccess if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <CreateMeetingDialog
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={handleSuccess}
      // The folder ID will be handled in our custom hook
    />
  );
};
