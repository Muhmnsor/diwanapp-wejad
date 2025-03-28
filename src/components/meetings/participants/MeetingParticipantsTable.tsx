
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { MeetingParticipant, ParticipantRole, AttendanceStatus } from '@/types/meeting';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { useDeleteMeetingParticipant } from '@/hooks/meetings/useDeleteMeetingParticipant';
import { Badge } from '@/components/ui/badge';

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

// Helper function to display the attendance status badge
const AttendanceStatusBadge = ({ status }: { status: AttendanceStatus }) => {
  switch (status) {
    case 'attended':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          حضر
        </Badge>
      );
    case 'confirmed':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          أكد الحضور
        </Badge>
      );
    case 'absent':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          غائب
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          بانتظار التأكيد
        </Badge>
      );
  }
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
            <TableHead>حالة الحضور</TableHead>
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
                <TableCell>
                  <AttendanceStatusBadge status={participant.attendance_status as AttendanceStatus} />
                </TableCell>
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
