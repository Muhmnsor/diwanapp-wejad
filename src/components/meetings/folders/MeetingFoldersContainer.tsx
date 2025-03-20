
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
  const { data, isLoading, error } = useMeetingFolders(refreshTrigger);
  
  // Pass the data from our optimized hook to the protected component
  // The MeetingFoldersList component likely expects the direct data prop, not "folders"
  return (
    <MeetingFoldersList
      data={data}
      isLoading={isLoading}
      error={error}
      refreshTrigger={refreshTrigger}
      onSuccess={onSuccess}
    />
  );
};
