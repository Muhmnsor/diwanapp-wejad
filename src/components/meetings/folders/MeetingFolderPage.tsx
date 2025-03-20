
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Folder, Edit, Trash, Users } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useMeetingFolder } from "@/hooks/meetings/useMeetingFolder";
import { MeetingsTable } from "./MeetingsTable";
import { EditFolderDialog } from "./EditFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { FolderMembersDialog } from "./FolderMembersDialog";

export const MeetingFolderPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { hasAdminRole } = useUserRoles();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: folder, isLoading, error } = useMeetingFolder(folderId as string, refreshTrigger);
  
  // Dialog states
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isMembersFolderOpen, setIsMembersFolderOpen] = useState(false);
  
  const refreshFolder = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleGoBack = () => {
    navigate("/admin/meetings");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-center">
          <span className="block mb-2">جاري تحميل التصنيف...</span>
        </div>
      </div>
    );
  }
  
  if (error || !folder) {
    return (
      <div className="text-destructive p-4 text-right">
        <Button variant="outline" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <p>حدث خطأ أثناء تحميل التصنيف أو التصنيف غير موجود</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 rtl">
      <div className="flex items-center mb-4">
        <Button variant="outline" onClick={handleGoBack} className="ml-4">
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">تصنيف: {folder.name}</h1>
      </div>
      
      <Card className="rtl text-right">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="py-[9px]">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary/70" />
                <span>{folder.name}</span>
              </div>
            </CardTitle>
            {folder.description && (
              <CardDescription>{folder.description}</CardDescription>
            )}
          </div>
          
          <div className="flex gap-2">
            {hasAdminRole && (
              <>
                <Button onClick={() => setIsEditFolderOpen(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 ml-1" />
                  تعديل
                </Button>
                <Button 
                  onClick={() => setIsMembersFolderOpen(true)} 
                  variant="outline" 
                  size="sm"
                >
                  <Users className="h-4 w-4 ml-1" />
                  الأعضاء
                </Button>
                <Button 
                  onClick={() => setIsDeleteFolderOpen(true)} 
                  variant="outline" 
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4 ml-1" />
                  حذف
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">الاجتماعات في هذا التصنيف</h2>
            <MeetingsTable folderId={folderId as string} />
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog components */}
      <EditFolderDialog
        open={isEditFolderOpen}
        onOpenChange={setIsEditFolderOpen}
        folder={folder}
        onSuccess={refreshFolder}
      />
      
      <DeleteFolderDialog
        open={isDeleteFolderOpen}
        onOpenChange={setIsDeleteFolderOpen}
        folderId={folder.id}
        onSuccess={() => navigate("/admin/meetings")}
      />
      
      <FolderMembersDialog
        open={isMembersFolderOpen}
        onOpenChange={setIsMembersFolderOpen}
        folder={folder}
        onSuccess={refreshFolder}
      />
    </div>
  );
};

export default MeetingFolderPage;
