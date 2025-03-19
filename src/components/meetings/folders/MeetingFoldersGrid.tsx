
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetingFolders } from "@/hooks/meetings/useMeetingFolders";
import { useMeetingsCount } from "@/hooks/meetings/useMeetingsCount";
import { MeetingFolderCard } from "./MeetingFolderCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const MeetingFoldersGrid = () => {
  const navigate = useNavigate();
  const { data: folders = [], isLoading: isFoldersLoading, error: foldersError } = useMeetingFolders();
  const { data: meetingsCounts = [], isLoading: isCountLoading } = useMeetingsCount();
  
  const getMeetingsCount = (folderId: string): number => {
    const countItem = meetingsCounts.find(item => item.folder_id === folderId);
    return countItem ? countItem.count : 0;
  };
  
  const handleFolderClick = (folderId: string) => {
    navigate(`/admin/meetings/folder/${folderId}`);
  };
  
  if (isFoldersLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل المجلدات...</span>
      </div>
    );
  }
  
  if (foldersError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل مجلدات الاجتماعات: {foldersError.message}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مجلدات الاجتماعات</h1>
      </div>
      
      {folders.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-lg border">
          <p className="text-muted-foreground">لا توجد مجلدات للعرض</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {folders.map((folder) => (
            <MeetingFolderCard 
              key={folder.id} 
              folder={folder} 
              meetingsCount={getMeetingsCount(folder.id)}
              isCountLoading={isCountLoading}
              onClick={() => handleFolderClick(folder.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
