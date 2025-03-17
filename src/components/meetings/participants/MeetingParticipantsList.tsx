
import { useState } from "react";
import { MeetingParticipant } from "@/types/meeting";
import { Button } from "@/components/ui/button";
import { Plus, UserX, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddParticipantDialog } from "./AddParticipantDialog";
import { useRemoveParticipant } from "@/hooks/meetings/useRemoveParticipant";
import { ParticipantRoleBadge } from "./ParticipantRoleBadge";
import { ParticipantAttendanceBadge } from "./ParticipantAttendanceBadge";

interface MeetingParticipantsListProps {
  participants: MeetingParticipant[];
  isLoading: boolean;
  error: Error | null;
  meetingId?: string;
}

export const MeetingParticipantsList = ({ 
  participants, 
  isLoading, 
  error, 
  meetingId 
}: MeetingParticipantsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { mutate: removeParticipant, isPending: isRemoving } = useRemoveParticipant();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>جاري تحميل المشاركين...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>حدث خطأ أثناء تحميل المشاركين</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">المشاركون ({participants.length})</h2>
        {meetingId && (
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            إضافة مشارك
          </Button>
        )}
      </div>
      
      {participants.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>حالة الحضور</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell>{participant.user_display_name || "غير محدد"}</TableCell>
                <TableCell>{participant.user_email || "غير محدد"}</TableCell>
                <TableCell>
                  <ParticipantRoleBadge role={participant.role} />
                </TableCell>
                <TableCell>
                  <ParticipantAttendanceBadge status={participant.attendance_status} />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      if (meetingId) {
                        removeParticipant({
                          meetingId,
                          participantId: participant.id
                        });
                      }
                    }}
                    disabled={isRemoving}
                  >
                    <UserX className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 bg-muted/30 rounded-md">
          <p className="text-muted-foreground">لا يوجد مشاركون حتى الآن</p>
        </div>
      )}
      
      {meetingId && (
        <AddParticipantDialog 
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          meetingId={meetingId}
        />
      )}
    </div>
  );
};
