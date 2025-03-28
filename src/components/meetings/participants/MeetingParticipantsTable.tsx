
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { MeetingParticipant } from '@/types/meeting';
import { useDeleteMeetingParticipant } from '@/hooks/meetings/useDeleteMeetingParticipant';
import { Button } from '@/components/ui/button';
import { SendNotificationDialog } from './SendNotificationDialog';
import { Trash, Mail } from 'lucide-react';
import { useMeetingRoles } from '@/hooks/meetings/useMeetingRoles';

interface MeetingParticipantsTableProps {
  participants: MeetingParticipant[];
  meetingId: string;
}

export const MeetingParticipantsTable: React.FC<MeetingParticipantsTableProps> = ({ 
  participants, 
  meetingId 
}) => {
  const { mutate: deleteParticipant, isPending: isDeleting } = useDeleteMeetingParticipant();
  const [selectedParticipant, setSelectedParticipant] = React.useState<MeetingParticipant | null>(null);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const { getRoleLabel } = useMeetingRoles();

  const handleDelete = (participantId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشارك؟')) {
      deleteParticipant(participantId);
    }
  };

  const handleSendNotification = (participant: MeetingParticipant) => {
    setSelectedParticipant(participant);
    setNotificationOpen(true);
  };

  // Sort participants by role: chairman, member, observer, secretary
  const sortedParticipants = [...participants].sort((a, b) => {
    const roleOrder: Record<string, number> = {
      chairman: 1,
      member: 2,
      observer: 3,
      secretary: 4
    };
    
    return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
  });

  const handleNotificationSuccess = () => {
    // Notification sent successfully
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>الصفة</TableHead>
            <TableHead>الدور</TableHead>
            <TableHead>حالة الحضور</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.map(participant => (
            <TableRow key={participant.id}>
              <TableCell className="font-medium">{participant.user_display_name}</TableCell>
              <TableCell>{participant.title || '-'}</TableCell>
              <TableCell>
                <MeetingParticipantRoleBadge role={participant.role as any} />
              </TableCell>
              <TableCell>
                {participant.attendance_status === 'pending' ? 'لم يؤكد' : 
                participant.attendance_status === 'confirmed' ? 'أكد الحضور' :
                participant.attendance_status === 'attended' ? 'حضر' : 'غائب'}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSendNotification(participant)}
                  disabled={!participant.phone && !participant.user_id}
                >
                  <Mail className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-100" 
                  onClick={() => handleDelete(participant.id)}
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedParticipant && (
        <SendNotificationDialog
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          participant={selectedParticipant}
          meetingId={meetingId}
          onSendNotification={(templateId, variables) => {
            console.log('Sending notification', { templateId, variables });
            // Here you would call the actual API to send notification
            // For now just close the dialog
            setNotificationOpen(false);
            handleNotificationSuccess();
          }}
          isSending={false}
        />
      )}
    </>
  );
};
