
import React, { useState } from "react";
import { useMeetingFolders } from "@/hooks/meetings/useMeetingFolders";
import { MeetingFolderCard } from "./MeetingFolderCard";
import { EditFolderDialog } from "./EditFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { FolderMembersDialog } from "./FolderMembersDialog";
import { useUserRoles } from "@/hooks/useUserRoles";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Folder, Plus } from "lucide-react";

interface MeetingFoldersContainerProps {
  refreshTrigger: number;
  onSuccess?: () => void;
  onAddFolder?: () => void;
}

export const MeetingFoldersContainer = ({ 
  refreshTrigger, 
  onSuccess,
  onAddFolder
}: MeetingFoldersContainerProps) => {
  const { data, isLoading, error } = useMeetingFolders(refreshTrigger);
  const { hasAdminRole } = useUserRoles();
  
  // States for managing folder dialogs
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isMembersFolderOpen, setIsMembersFolderOpen] = useState(false);
  
  // Handler for edit button
  const handleEditFolder = (folder: any) => {
    setSelectedFolder(folder);
    setIsEditFolderOpen(true);
  };
  
  // Handler for delete button
  const handleDeleteFolder = (folder: any) => {
    setSelectedFolder(folder);
    setIsDeleteFolderOpen(true);
  };
  
  // Handler for manage members button
  const handleManageMembers = (folder: any) => {
    setSelectedFolder(folder);
    setIsMembersFolderOpen(true);
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل التصنيفات...</div>;
  }
  
  if (error) {
    return <div className="text-destructive p-4 text-right">حدث خطأ أثناء تحميل التصنيفات</div>;
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Folder className="h-10 w-10 opacity-50" />}
        title="لا توجد تصنيفات"
        description="قم بإنشاء أول تصنيف للاجتماعات للبدء في تنظيم الاجتماعات"
        action={
          <Button onClick={onAddFolder}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة تصنيف جديد
          </Button>
        }
      />
    );
  }
  
  return (
    <div className="space-y-4 rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {data.map(folder => (
          <MeetingFolderCard 
            key={folder.id} 
            folder={folder}
            onEdit={handleEditFolder}
            onDelete={handleDeleteFolder}
            onManageMembers={handleManageMembers}
          />
        ))}
      </div>
      
      {/* Dialog components */}
      {selectedFolder && (
        <>
          <EditFolderDialog
            open={isEditFolderOpen}
            onOpenChange={setIsEditFolderOpen}
            folder={selectedFolder}
            onSuccess={onSuccess}
          />
          
          <DeleteFolderDialog
            open={isDeleteFolderOpen}
            onOpenChange={setIsDeleteFolderOpen}
            folderId={selectedFolder.id}
            onSuccess={onSuccess}
          />
          
          <FolderMembersDialog
            open={isMembersFolderOpen}
            onOpenChange={setIsMembersFolderOpen}
            folder={selectedFolder}
            onSuccess={onSuccess}
          />
        </>
      )}
    </div>
  );
};
