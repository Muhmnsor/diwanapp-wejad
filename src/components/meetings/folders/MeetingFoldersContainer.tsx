
import React from "react";
import { MeetingFoldersList } from "../folders/MeetingFoldersList";
import { useMeetingFolders } from "@/hooks/meetings/useMeetingFolders";

interface MeetingFoldersContainerProps {
  refreshTrigger: number;
  onSuccess?: () => void;
}

export const MeetingFoldersContainer = ({ 
  refreshTrigger, 
  onSuccess 
}: MeetingFoldersContainerProps) => {
  const { data: folders, isLoading, error } = useMeetingFolders(refreshTrigger);
  
  // Pass the data from our optimized hook to the protected component
  return (
    <MeetingFoldersList
      folders={folders}
      isLoading={isLoading}
      error={error}
      refreshTrigger={refreshTrigger}
      onSuccess={onSuccess}
    />
  );
};
