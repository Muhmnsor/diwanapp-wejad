
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";
import { ParticipantRoleBadge } from "./ParticipantRoleBadge";
import { ParticipantAttendanceBadge } from "./ParticipantAttendanceBadge";
import { MeetingParticipant } from "@/types/meeting";
import { useRemoveParticipant } from "@/hooks/meetings/useRemoveParticipant";
import { useUpdateParticipantStatus } from "@/hooks/meetings/useUpdateParticipantStatus";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckIcon, MoreVertical, UserMinus, UserX } from "lucide-react";

interface ParticipantsTableRowProps {
  participant: MeetingParticipant;
  meetingId: string;
  canManageParticipants?: boolean;
}

export const ParticipantsTableRow = ({
  participant,
  meetingId,
  canManageParticipants = true,
}: ParticipantsTableRowProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { removeParticipant, isRemoving } = useRemoveParticipant();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateParticipantStatus();

  const handleDelete = async () => {
    try {
      await removeParticipant({
        participantId: participant.id,
        meetingId,
      });
      setShowDeleteDialog(false);
      toast.success("تم حذف المشارك بنجاح");
    } catch (error) {
      console.error("Error removing participant:", error);
      toast.error("حدث خطأ أثناء حذف المشارك");
    }
  };

  const handleStatusChange = (status: "pending" | "confirmed" | "attended" | "absent") => {
    updateStatus(
      {
        participantId: participant.id,
        attendanceStatus: status,
        meetingId,
      },
      {
        onSuccess: () => {
          const statusMessages = {
            pending: "في انتظار التأكيد",
            confirmed: "تم تأكيد الحضور",
            attended: "حضر",
            absent: "متغيب",
          };
          toast.success(`تم تحديث حالة المشارك إلى ${statusMessages[status]}`);
        },
      }
    );
  };

  return (
    <>
      <TableRow key={participant.id}>
        <TableCell className="font-medium">{participant.user?.name || participant.name || "مشارك"}</TableCell>
        <TableCell>{participant.email}</TableCell>
        <TableCell>
          <ParticipantRoleBadge role={participant.role} />
        </TableCell>
        <TableCell>
          <ParticipantAttendanceBadge status={participant.attendance_status} />
        </TableCell>
        {canManageParticipants && (
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">فتح القائمة</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange("confirmed")}>
                  <CheckIcon className="ml-2 h-4 w-4" />
                  تأكيد الحضور
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("attended")}>
                  <CheckIcon className="ml-2 h-4 w-4" />
                  تسجيل الحضور
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("absent")}>
                  <UserX className="ml-2 h-4 w-4" />
                  تسجيل الغياب
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  <UserMinus className="ml-2 h-4 w-4" />
                  حذف المشارك
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        )}
      </TableRow>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="حذف المشارك"
        description={`هل أنت متأكد من حذف ${participant.name || participant.email || "هذا المشارك"}؟`}
        onDelete={handleDelete}
        isDeleting={isRemoving}
      />
    </>
  );
};
