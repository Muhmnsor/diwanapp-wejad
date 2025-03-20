
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Folder, Edit, Trash, Users, Plus } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useMeetingFolder } from "@/hooks/meetings/useMeetingFolder";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import { EditFolderDialog } from "./EditFolderDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { FolderMembersDialog } from "./FolderMembersDialog";
import { useMeetings } from "@/hooks/meetings/useMeetings";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingDialogWrapper } from "@/components/meetings/dialogs/MeetingDialogWrapper";

export const MeetingFolderPage = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { hasAdminRole } = useUserRoles();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data: folder, isLoading, error } = useMeetingFolder(folderId as string, refreshTrigger);
  const { data: meetings, isLoading: isLoadingMeetings, error: meetingsError } = useMeetings(folderId, refreshTrigger);
  
  // Dialog states
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isMembersFolderOpen, setIsMembersFolderOpen] = useState(false);
  const [isCreateMeetingOpen, setIsCreateMeetingOpen] = useState(false);
  
  const refreshFolder = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleGoBack = () => {
    navigate("/admin/meetings");
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="flex justify-center p-8 flex-grow">
          <div className="text-center">
            <span className="block mb-2">جاري تحميل التصنيف...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !folder) {
    return (
      <div className="min-h-screen flex flex-col rtl" dir="rtl">
        <AdminHeader />
        <div className="text-destructive p-4 text-right container mx-auto flex-grow">
          <Button variant="outline" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <p>حدث خطأ أثناء تحميل التصنيف أو التصنيف غير موجود</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col rtl" dir="rtl">
      <AdminHeader />
      
      {/* Secondary Header - replacing the current header content */}
      <div className="w-full border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleGoBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
            
            <div className="text-center font-medium text-lg">
              <span className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary/70" />
                تصنيف: {folder.name}
              </span>
            </div>
            
            <Button onClick={() => setIsCreateMeetingOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              اجتماع جديد
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 flex-grow">
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">الاجتماعات في هذا التصنيف</h2>
              </div>
              <MeetingsList 
                meetings={meetings || []} 
                isLoading={isLoadingMeetings} 
                error={meetingsError} 
                folderId={folderId}
                onCreate={refreshFolder}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
      
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
      
      <MeetingDialogWrapper
        open={isCreateMeetingOpen}
        onOpenChange={setIsCreateMeetingOpen}
        onSuccess={refreshFolder}
        folderId={folderId}
      />
    </div>
  );
};

export default MeetingFolderPage;
