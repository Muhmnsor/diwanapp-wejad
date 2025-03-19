
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMeetingFolder } from "@/hooks/meetings/useMeetingFolder";
import { useFolderMeetings } from "@/hooks/meetings/useFolderMeetings";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingsTable } from "./MeetingsTable";
import { MeetingDialogWrapper } from "../dialogs/MeetingDialogWrapper";
import { getFolderIcon } from "./folderIcons";

export const MeetingFolderContent = () => {
  const { id: folderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  
  const { 
    data: folder, 
    isLoading: isFolderLoading, 
    error: folderError 
  } = useMeetingFolder(folderId);
  
  const { 
    data: meetings = [], 
    isLoading: isMeetingsLoading, 
    error: meetingsError,
    refetch 
  } = useFolderMeetings(folderId, {
    status: statusFilter,
    type: typeFilter
  });
  
  const handleBackClick = () => {
    navigate('/admin/meetings');
  };
  
  const handleCreateSuccess = () => {
    refetch();
  };
  
  const handleMeetingClick = (meetingId: string) => {
    navigate(`/admin/meetings/${meetingId}`);
  };
  
  if (isFolderLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل البيانات...</span>
      </div>
    );
  }
  
  if (folderError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل بيانات المجلد: {folderError.message}
        </AlertDescription>
        <Button variant="outline" className="mt-4" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للمجلدات
        </Button>
      </Alert>
    );
  }
  
  if (!folder) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          المجلد غير موجود
        </AlertDescription>
        <Button variant="outline" className="mt-4" onClick={handleBackClick}>
          <ArrowLeft className="h-4 w-4 ml-2" />
          العودة للمجلدات
        </Button>
      </Alert>
    );
  }
  
  const IconComponent = getFolderIcon(folder.type, folder.icon);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <IconComponent className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{folder.name}</h1>
          </div>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          اجتماع جديد
        </Button>
      </div>
      
      {folder.description && (
        <p className="text-muted-foreground mb-6">{folder.description}</p>
      )}
      
      <MeetingsTable 
        meetings={meetings}
        isLoading={isMeetingsLoading}
        error={meetingsError as Error}
        onMeetingClick={handleMeetingClick}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
      />
      
      <MeetingDialogWrapper
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
        folderId={folderId}
      />
    </div>
  );
};
