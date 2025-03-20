
import { useParams, useNavigate } from "react-router-dom";
import { useMeetingFolder } from "@/hooks/meetings/useMeetingFolder";
import { useFolderMeetings } from "@/hooks/meetings/useFolderMeetings";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { getFolderIcon } from "./folderIcons";

export const MeetingFolderContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    data: folder, 
    isLoading: isFolderLoading, 
    error: folderError 
  } = useMeetingFolder(id);
  
  const {
    data: meetings = [],
    isLoading: isMeetingsLoading,
    error: meetingsError
  } = useFolderMeetings(id);
  
  if (isFolderLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل المجلد...</span>
      </div>
    );
  }
  
  if (folderError || !folder) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ</AlertTitle>
        <AlertDescription>
          حدث خطأ أثناء تحميل المجلد: {folderError?.message || "المجلد غير موجود"}
        </AlertDescription>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/admin/meetings")}
        >
          <ArrowRight className="mr-2 h-4 w-4" />
          العودة إلى المجلدات
        </Button>
      </Alert>
    );
  }
  
  const IconComponent = getFolderIcon(folder.type, folder.icon);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/admin/meetings")}
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          العودة
        </Button>
        
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-lg mr-2">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{folder.name}</h1>
        </div>
      </div>
      
      {folder.description && (
        <p className="text-muted-foreground mb-6">{folder.description}</p>
      )}
      
      <MeetingsList 
        meetings={meetings} 
        isLoading={isMeetingsLoading} 
        error={meetingsError as Error} 
        folderId={id}
      />
    </div>
  );
};
