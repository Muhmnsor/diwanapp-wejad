
import React from "react";
import { Meeting } from "@/types/meeting";
import { MeetingsTable } from "@/components/meetings/table/MeetingsTable";
import { processMeetingsData } from "@/utils/meeting-utils";

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  error: any;
  folderId?: string;
  onCreate?: () => void;
}

export const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  isLoading,
  error,
  folderId,
  onCreate
}) => {
  // Process the meetings to ensure compatibility with MeetingsTable
  const processedMeetings = processMeetingsData(meetings);
  
  if (isLoading) {
    return <div className="text-center p-8">جاري تحميل الاجتماعات...</div>;
  }
  
  if (error) {
    return <div className="text-destructive p-4 text-right">حدث خطأ أثناء تحميل الاجتماعات</div>;
  }
  
  if (!processedMeetings || processedMeetings.length === 0) {
    return <div className="text-muted-foreground text-center p-8">لا توجد اجتماعات في هذا التصنيف</div>;
  }
  
  return (
    <MeetingsTable 
      meetings={processedMeetings} 
      folderId={folderId} 
      onCreateSuccess={onCreate} 
    />
  );
};
