
import React, { useState } from 'react';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { useUpdateParticipantAttendance } from '@/hooks/meetings/useUpdateParticipantAttendance';
import { useUpdateParticipantRole } from '@/hooks/meetings/useUpdateParticipantRole';
import { useDeleteMeetingParticipant } from '@/hooks/meetings/useDeleteMeetingParticipant';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/ui/delete-dialog';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { AttendanceStatus, ParticipantRole } from '@/types/meeting';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';

interface MeetingParticipantsContentProps {
  meetingId: string;
}

export const MeetingParticipantsContent: React.FC<MeetingParticipantsContentProps> = ({ meetingId }) => {
  const { data: participants, isLoading } = useMeetingParticipants(meetingId);
  const { mutate: updateAttendance } = useUpdateParticipantAttendance();
  const { mutate: updateRole } = useUpdateParticipantRole();
  const { mutate: deleteParticipant, isPending: isDeleting } = useDeleteMeetingParticipant();
  const { getRoleOptions } = useMeetingRoles();
  const queryClient = useQueryClient();
  
  const roleOptions = getRoleOptions();
  
  // State for delete confirmation dialog
  const [participantToDelete, setParticipantToDelete] = useState<{ id: string, name: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleRoleChange = (participantId: string, newRole: string) => {
    updateRole({ participantId, role: newRole });
  };

  const handleDeleteClick = (id: string, name: string) => {
    setParticipantToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (participantToDelete) {
      console.log('Deleting participant:', participantToDelete.id);
      
      deleteParticipant(participantToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setParticipantToDelete(null);
          toast.success('تم حذف المشارك بنجاح');
          queryClient.invalidateQueries({ queryKey: ['meeting-participants', meetingId] });
        },
        onError: (error) => {
          console.error('Error deleting participant:', error);
          toast.error('حدث خطأ أثناء حذف المشارك');
        }
      });
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (!participants?.length) {
    return <div className="text-center p-4">لا يوجد مشاركين حتى الآن</div>;
  }

  const getAttendanceButtonClass = (status: string, buttonStatus: AttendanceStatus) => {
    return `px-3 py-1 rounded ${
      status === buttonStatus
        ? 'bg-primary text-primary-foreground'
        : 'bg-secondary hover:bg-secondary/80'
    }`;
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">الاسم</TableHead>
              <TableHead className="text-center">البريد الإلكتروني</TableHead>
              <TableHead className="text-center">رقم الجوال</TableHead>
              <TableHead className="text-center">الدور</TableHead>
              <TableHead className="text-center">الصفة</TableHead>
              <TableHead className="text-center">الحضور</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="text-center">{participant.user_display_name}</TableCell>
                <TableCell className="text-center">{participant.user_email}</TableCell>
                <TableCell className="text-center">{participant.phone || '-'}</TableCell>
                <TableCell className="text-center">
                  <Select 
                    value={participant.role} 
                    onValueChange={(value) => handleRoleChange(participant.id, value)}
                  >
                    <SelectTrigger className="w-[150px] mx-auto">
                      <SelectValue>
                        <MeetingParticipantRoleBadge role={participant.role as ParticipantRole} />
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-center">{participant.title || '-'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => updateAttendance({ 
                        participantId: participant.id,
                        attendanceStatus: 'attended'
                      })}
                      className={getAttendanceButtonClass(participant.attendance_status, 'attended')}
                    >
                      حضر
                    </button>
                    <button
                      onClick={() => updateAttendance({ 
                        participantId: participant.id,
                        attendanceStatus: 'absent'
                      })}
                      className={getAttendanceButtonClass(participant.attendance_status, 'absent')}
                    >
                      غائب
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(participant.id, participant.user_display_name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف المشارك"
        description={`هل أنت متأكد من حذف المشارك "${participantToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};
