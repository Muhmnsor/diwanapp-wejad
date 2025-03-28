
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
  const { folderId } = useParams<{ folderId: string; }>();
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
        <div className="container mx-auto px-4 py-6 flex-grow">
          <Button variant="outline" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <div className="flex justify-center p-8">
            <div className="text-center">
              <span className="block mb-2">جاري تحميل التصنيف...</span>
            </div>
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
        <div className="container mx-auto px-4 py-6 flex-grow">
          <Button variant="outline" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <div className="text-destructive p-4 text-right">
            <p>حدث خطأ أثناء تحميل التصنيف أو التصنيف غير موجود</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col rtl" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button variant="outline" onClick={handleGoBack} className="ml-4">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
            <h1 className="text-2xl font-bold">تصنيف: {folder.name}</h1>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateMeetingOpen(true)} variant="default">
              <Plus className="h-4 w-4 ml-2" />
              إضافة اجتماع
            </Button>
            <Button onClick={() => setIsMembersFolderOpen(true)} variant="outline">
              <Users className="h-4 w-4 ml-2" />
              الأعضاء
            </Button>
            <Button onClick={() => setIsEditFolderOpen(true)} variant="outline">
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            <Button onClick={() => setIsDeleteFolderOpen(true)} variant="outline" className="text-destructive hover:text-destructive">
              <Trash className="h-4 w-4 ml-2" />
              حذف
            </Button>
          </div>
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
              {folder.description && <CardDescription>{folder.description}</CardDescription>}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="mt-6">
              <MeetingsList meetings={meetings || []} isLoading={isLoadingMeetings} error={meetingsError} folderId={folderId} onCreate={refreshFolder} />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
      
      {/* Dialog components */}
      <EditFolderDialog open={isEditFolderOpen} onOpenChange={setIsEditFolderOpen} folder={folder} onSuccess={refreshFolder} />
      <DeleteFolderDialog open={isDeleteFolderOpen} onOpenChange={setIsDeleteFolderOpen} folderId={folder.id} onSuccess={() => navigate("/admin/meetings")} />
      <FolderMembersDialog open={isMembersFolderOpen} onOpenChange={setIsMembersFolderOpen} folder={folder} onSuccess={refreshFolder} />
      <MeetingDialogWrapper open={isCreateMeetingOpen} onOpenChange={setIsCreateMeetingOpen} onSuccess={refreshFolder} folderId={folderId} />
    </div>
  );
};

export default MeetingFolderPage;
