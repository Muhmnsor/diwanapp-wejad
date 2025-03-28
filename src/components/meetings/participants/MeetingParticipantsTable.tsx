
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { MeetingParticipant, ParticipantRole } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useDeleteMeetingParticipant } from '@/hooks/meetings/useDeleteMeetingParticipant';

interface MeetingParticipantsTableProps {
  participants: MeetingParticipant[];
  allowDelete?: boolean;
  showActions?: boolean;
}

// A helper function to sort participants by role importance
export const sortParticipantsByRole = (participants: MeetingParticipant[]): MeetingParticipant[] => {
  const roleOrder: Record<string, number> = {
    'chairman': 1,
    'secretary': 2,
    'member': 3,
    'observer': 4
  };
  
  return [...participants].sort((a, b) => {
    const roleA = a.role as string;
    const roleB = b.role as string;
    return (roleOrder[roleA] || 999) - (roleOrder[roleB] || 999);
  });
};

export const MeetingParticipantsTable: React.FC<MeetingParticipantsTableProps> = ({ 
  participants,
  allowDelete = false,
  showActions = true
}) => {
  const { mutate: deleteParticipant, isPending } = useDeleteMeetingParticipant();
  
  const sortedParticipants = sortParticipantsByRole(participants);
  
  const handleDelete = (participantId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشارك؟')) {
      deleteParticipant(participantId);
    }
  };
  
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">الاسم</TableHead>
            <TableHead>المنصب</TableHead>
            <TableHead>الدور في الاجتماع</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            {showActions && <TableHead className="text-left">إجراءات</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.length > 0 ? (
            sortedParticipants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">{participant.user_display_name}</TableCell>
                <TableCell>{participant.title || '-'}</TableCell>
                <TableCell>
                  <MeetingParticipantRoleBadge role={participant.role as ParticipantRole} />
                </TableCell>
                <TableCell>{participant.user_email}</TableCell>
                {showActions && (
                  <TableCell>
                    {allowDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(participant.id)}
                        disabled={isPending}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showActions ? 5 : 4} className="text-center py-6 text-gray-500">
                لا يوجد مشاركين حتى الآن
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
