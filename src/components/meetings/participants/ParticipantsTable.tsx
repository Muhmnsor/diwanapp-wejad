
import { useState } from "react";
import { MeetingParticipant, AttendanceStatus } from "@/types/meeting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Check, CheckCircle, Clock, X, MoreVertical, UserX, ChevronDown } from "lucide-react";
import { ParticipantRoleBadge } from "./ParticipantRoleBadge";
import { ParticipantAttendanceBadge } from "./ParticipantAttendanceBadge";
import { useRemoveParticipant } from "@/hooks/meetings/useRemoveParticipant";
import { useUpdateParticipantStatus } from "@/hooks/meetings/useUpdateParticipantStatus";
import { DeleteDialog } from "@/components/ui/delete-dialog";

interface ParticipantsTableProps {
  participants: MeetingParticipant[];
  meetingId: string;
}

export const ParticipantsTable = ({ participants, meetingId }: ParticipantsTableProps) => {
  const [selectedParticipant, setSelectedParticipant] = useState<MeetingParticipant | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const { mutate: removeParticipant, isPending: isRemoving } = useRemoveParticipant();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateParticipantStatus();
  
  const handleRemove = () => {
    if (!selectedParticipant) return;
    
    removeParticipant({
      meetingId,
      participantId: selectedParticipant.id
    }, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setSelectedParticipant(null);
      }
    });
  };
  
  const handleUpdateStatus = (participant: MeetingParticipant, status: AttendanceStatus) => {
    updateStatus({
      meetingId,
      participantId: participant.id,
      attendanceStatus: status
    });
  };
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>حالة الحضور</TableHead>
            <TableHead className="w-[100px]">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell className="font-medium">{participant.user_display_name || "غير محدد"}</TableCell>
              <TableCell>{participant.user_email || "غير محدد"}</TableCell>
              <TableCell>
                <ParticipantRoleBadge role={participant.role} />
              </TableCell>
              <TableCell>
                <ParticipantAttendanceBadge status={participant.attendance_status} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">فتح القائمة</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" dir="rtl">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedParticipant(participant);
                          setShowDeleteDialog(true);
                        }}
                        className="text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        إزالة المشارك
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 flex items-center gap-1">
                        <span>الحالة</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" dir="rtl">
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(participant, "pending")}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        قيد الانتظار
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(participant, "confirmed")}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        مؤكد
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(participant, "attended")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        حضر
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleUpdateStatus(participant, "absent")}
                      >
                        <X className="mr-2 h-4 w-4" />
                        متغيب
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="إزالة المشارك"
        description={`هل أنت متأكد من رغبتك في إزالة المشارك ${selectedParticipant?.user_display_name || ''} من الاجتماع؟`}
        onDelete={handleRemove}
        isDeleting={isRemoving}
      />
    </>
  );
};
