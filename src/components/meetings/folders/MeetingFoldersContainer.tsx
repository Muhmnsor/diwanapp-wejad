
import React from "react";
import { useMeetingFolders } from "@/hooks/meetings/useMeetingFolders";
import { MeetingFolderCard } from "./MeetingFolderCard";

interface MeetingFoldersContainerProps {
  refreshTrigger: number;
  onSuccess?: () => void;
}

export const MeetingFoldersContainer = ({ 
  refreshTrigger, 
  onSuccess 
}: MeetingFoldersContainerProps) => {
  const { data, isLoading, error } = useMeetingFolders(refreshTrigger);
  
  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل التصنيفات...</div>;
  }
  
  if (error) {
    return <div className="text-destructive p-4 text-right">حدث خطأ أثناء تحميل التصنيفات</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="text-muted-foreground text-center p-8">لا توجد تصنيفات حالياً</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 rtl">
      {data.map(folder => (
        <MeetingFolderCard 
          key={folder.id} 
          folder={folder}
          onEdit={() => console.log('تعديل', folder.name)}
          onDelete={() => console.log('حذف', folder.name)}
          onManageMembers={() => console.log('إدارة الأعضاء', folder.name)}
        />
      ))}
    </div>
  );
};
