
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ArrowRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useDeleteMeeting } from "@/hooks/meetings/useDeleteMeeting";

interface MeetingHeaderEnhancedProps {
  meeting: Meeting;
}

export const MeetingHeaderEnhanced = ({ meeting }: MeetingHeaderEnhancedProps) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { mutate: deleteMeeting, isPending: isDeleting } = useDeleteMeeting();
  
  const handleDeleteMeeting = () => {
    deleteMeeting(meeting.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate("/admin/meetings/list");
      }
    });
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (meeting.folder_id) {
              navigate(`/admin/meetings/folder/${meeting.folder_id}`);
            } else {
              navigate("/admin/meetings/list");
            }
          }}
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          العودة
        </Button>
        
        <h1 className="text-2xl font-bold flex-grow">{meeting.title}</h1>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 ml-2" />
                تعديل الاجتماع
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف الاجتماع
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="حذف الاجتماع"
        description="هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ لا يمكن التراجع عن هذا الإجراء."
        onDelete={handleDeleteMeeting}
        isDeleting={isDeleting}
      />
    </div>
  );
};
