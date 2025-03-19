
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { FolderKanban, List, Plus } from "lucide-react";
import { useState } from "react";
import { MeetingDialogWrapper } from "./dialogs/MeetingDialogWrapper";

interface MeetingsNavHeaderProps {
  meetingId?: string;
  showCreateButton?: boolean;
}

export const MeetingsNavHeader = ({ meetingId, showCreateButton = true }: MeetingsNavHeaderProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { id: folderId } = useParams<{ id: string }>();
  
  return (
    <div className="border-b" dir="rtl">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link to="/admin/meetings">
            <Button variant="ghost" size="sm" className="font-bold">
              <FolderKanban className="h-4 w-4 mr-2" />
              المجلدات
            </Button>
          </Link>
          <Link to="/admin/meetings/list">
            <Button variant="ghost" size="sm" className="font-bold">
              <List className="h-4 w-4 mr-2" />
              الاجتماعات
            </Button>
          </Link>
        </div>
        
        {showCreateButton && (
          <div className="ml-auto flex items-center space-x-4 space-x-reverse">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              اجتماع جديد
            </Button>
          </div>
        )}
      </div>
      
      <MeetingDialogWrapper 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        folderId={folderId}
      />
    </div>
  );
};
