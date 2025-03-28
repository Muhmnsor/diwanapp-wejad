
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MeetingParticipant, ParticipantRole } from '@/types/meeting';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { useDeleteMeetingParticipant } from '@/hooks/meetings/useDeleteMeetingParticipant';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ParticipantsListProps {
  meetingId: string;
  showActions?: boolean;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ 
  meetingId,
  showActions = true
}) => {
  const { data: participants, isLoading, error } = useMeetingParticipants(meetingId);
  const { mutate: deleteParticipant, isPending: isDeleting } = useDeleteMeetingParticipant();

  const handleDelete = (participantId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المشارك؟')) {
      deleteParticipant(participantId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error || !participants) {
    return (
      <div className="p-4 text-center text-red-500">
        حدث خطأ أثناء تحميل بيانات المشاركين
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        لا يوجد مشاركون في الاجتماع
      </div>
    );
  }

  return (
    <Table className="border rounded-md">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">الاسم</TableHead>
          <TableHead className="w-[20%]">المنصب</TableHead>
          <TableHead className="w-[20%]">الدور</TableHead>
          {showActions && <TableHead className="w-[20%]">الإجراءات</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell className="font-medium">
              <div>
                {participant.user_display_name}
                <div className="text-xs text-gray-500">
                  {participant.user_email}
                </div>
              </div>
            </TableCell>
            <TableCell>{participant.title || '-'}</TableCell>
            <TableCell>
              <MeetingParticipantRoleBadge role={participant.role as ParticipantRole} />
            </TableCell>
            {showActions && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(participant.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف</span>
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
