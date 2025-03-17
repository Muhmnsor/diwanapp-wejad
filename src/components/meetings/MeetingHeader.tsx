
import { Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { EditMeetingDialog } from "./dialogs/EditMeetingDialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useDeleteMeeting } from "@/hooks/meetings/useDeleteMeeting";

interface MeetingHeaderProps {
  meeting: Meeting;
}

export const MeetingHeader = ({ meeting }: MeetingHeaderProps) => {
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { mutate: deleteMeeting, isPending: isDeleting } = useDeleteMeeting();
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "scheduled": return "مجدول";
      case "in_progress": return "جاري";
      case "completed": return "مكتمل";
      case "cancelled": return "ملغي";
      default: return status || "غير محدد";
    }
  };
  
  const handleDelete = async () => {
    deleteMeeting(meeting.id, {
      onSuccess: () => {
        navigate("/admin/meetings/list");
      }
    });
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <Badge className={getStatusColor(meeting.meeting_status)}>
            {getStatusLabel(meeting.meeting_status)}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-2">
          {meeting.objectives || "لا يوجد وصف للاجتماع"}
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate("/admin/meetings/list")}>
          <ArrowRight className="mr-2 h-4 w-4" />
          العودة للقائمة
        </Button>
        <Button 
          variant="outline"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit className="mr-2 h-4 w-4" />
          تعديل
        </Button>
        <Button 
          variant="destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          حذف
        </Button>
      </div>
      
      {/* مربع حوار التعديل */}
      <EditMeetingDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        meeting={meeting}
      />
      
      {/* مربع حوار الحذف */}
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="حذف الاجتماع"
        description="هل أنت متأكد من رغبتك في حذف هذا الاجتماع؟ سيتم حذف جميع البيانات المرتبطة به ولا يمكن التراجع عن هذا الإجراء."
        onDelete={handleDelete}
      />
    </div>
  );
};
