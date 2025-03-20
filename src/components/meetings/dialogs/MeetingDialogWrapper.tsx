
import React from "react";
import { useParams } from "react-router-dom";
import { CreateMeetingDialog } from "./CreateMeetingDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateMeetingWithFolder } from "@/hooks/meetings/useCreateMeetingWithFolder";

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
  const { mutate: createMeeting, isPending } = useCreateMeetingWithFolder();
  
  // Use either the prop folderId or the route parameter
  const effectiveFolderId = folderId || routeFolderId;
  
  const handleCreateMeeting = (formData: any) => {
    createMeeting(
      { 
        ...formData, 
        folder_id: effectiveFolderId 
      },
      {
        onSuccess: () => {
          // Invalidate relevant queries
          if (effectiveFolderId) {
            queryClient.invalidateQueries({ queryKey: ['folder-meetings', effectiveFolderId] });
          }
          queryClient.invalidateQueries({ queryKey: ['meetings'] });
          queryClient.invalidateQueries({ queryKey: ['meetings-count'] });
          
          // Call the original onSuccess if provided
          if (onSuccess) {
            onSuccess();
          }
          
          // Close the dialog
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <CreateMeetingDialog
      open={open}
      onOpenChange={onOpenChange}
      isPending={isPending}
      folderId={effectiveFolderId}
      onCreateMeeting={handleCreateMeeting}
    />
  );
};
