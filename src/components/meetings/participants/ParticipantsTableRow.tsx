
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserMinus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MeetingParticipant } from "@/types/meeting";
import { toast } from "sonner";
import { ParticipantRoleBadge } from "./ParticipantRoleBadge";
import { ParticipantAttendanceBadge } from "./ParticipantAttendanceBadge";
import { useRemoveParticipant } from "@/hooks/meetings/useRemoveParticipant";
import { useUpdateParticipantStatus } from "@/hooks/meetings/useUpdateParticipantStatus";

interface ParticipantsTableRowProps {
  participant: MeetingParticipant;
  meetingId: string;
}

export const ParticipantsTableRow = ({
  participant,
  meetingId,
}: ParticipantsTableRowProps) => {
  const { mutate: removeParticipant, isPending: isRemoving } = useRemoveParticipant(meetingId);
  const { mutate: updateStatus } = useUpdateParticipantStatus(meetingId);

  const handleRemove = () => {
    removeParticipant(participant.id, {
      onSuccess: () => {
        toast.success("تم حذف المشارك بنجاح");
      },
      onError: (error) => {
        toast.error(`فشل في حذف المشارك: ${error.message}`);
      },
    });
  };

  const handleStatusChange = (status: string) => {
    updateStatus(
      { participantId: participant.id, status: status as any },
      {
        onSuccess: () => {
          toast.success("تم تحديث حالة المشارك بنجاح");
        },
        onError: (error) => {
          toast.error(`فشل في تحديث حالة المشارك: ${error.message}`);
        },
      }
    );
  };

  return (
    <TableRow>
      <TableCell>
        {participant.user_display_name}
      </TableCell>
      <TableCell>{participant.user_email}</TableCell>
      <TableCell>
        <ParticipantRoleBadge role={participant.role} />
      </TableCell>
      <TableCell>
        <ParticipantAttendanceBadge status={participant.attendance_status} />
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isRemoving}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange("confirmed")}>
              تأكيد الحضور
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("attended")}>
              تسجيل كحاضر
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("absent")}>
              تسجيل كغائب
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleRemove}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              إزالة المشارك
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
