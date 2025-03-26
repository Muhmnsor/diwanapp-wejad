
import React from 'react';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { useUpdateParticipantAttendance } from '@/hooks/meetings/useUpdateParticipantAttendance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { AttendanceStatus, ParticipantRole } from '@/types/meeting';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MeetingParticipantsContentProps {
  meetingId: string;
}

export const MeetingParticipantsContent: React.FC<MeetingParticipantsContentProps> = ({ meetingId }) => {
  const { data: participants, isLoading } = useMeetingParticipants(meetingId);
  const { mutate: updateAttendance } = useUpdateParticipantAttendance();
  const { getRoleOptions } = useMeetingRoles();
  const queryClient = useQueryClient();
  
  const roleOptions = getRoleOptions();

  // New mutation for updating participant role
  const { mutate: updateRole } = useMutation({
    mutationFn: async ({ participantId, role }: { participantId: string; role: string }) => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .update({ role })
        .eq('id', participantId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const roleLabel = roleOptions.find(option => option.value === data.role)?.label || data.role;
      toast.success(`تم تحديث دور المشارك إلى "${roleLabel}"`);
      queryClient.invalidateQueries({ queryKey: ['meeting-participants', data.meeting_id] });
    },
    onError: (error) => {
      console.error("Error updating participant role:", error);
      toast.error("حدث خطأ أثناء تحديث دور المشارك");
    }
  });

  const handleRoleChange = (participantId: string, newRole: string) => {
    updateRole({ participantId, role: newRole });
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>الصفة</TableHead>
            <TableHead>الحضور</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell>{participant.user_display_name}</TableCell>
              <TableCell>{participant.user_email}</TableCell>
              <TableCell>
                <Select 
                  value={participant.role} 
                  onValueChange={(value) => handleRoleChange(participant.id, value)}
                >
                  <SelectTrigger className="w-[150px]">
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
              <TableCell>{participant.title || '-'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
