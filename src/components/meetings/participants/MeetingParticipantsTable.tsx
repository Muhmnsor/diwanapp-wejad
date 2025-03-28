
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { MeetingParticipant } from '@/types/meeting';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface MeetingParticipantsTableProps {
  participants: MeetingParticipant[];
  isLoading?: boolean;
  showTitle?: boolean;
}

export const MeetingParticipantsTable: React.FC<MeetingParticipantsTableProps> = ({ 
  participants, 
  isLoading = false,
  showTitle = true
}) => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground py-4">لا يوجد مشاركين في هذا الاجتماع</p>
      </Card>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          {showTitle && <TableHead>الصفة</TableHead>}
          <TableHead>الدور</TableHead>
          <TableHead>حالة الحضور</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell className="font-medium">{participant.user_display_name}</TableCell>
            {showTitle && <TableCell>{participant.title || '-'}</TableCell>}
            <TableCell>
              <MeetingParticipantRoleBadge role={participant.role as any} />
            </TableCell>
            <TableCell>
              {participant.attendance_status === 'attended' ? (
                <span className="text-green-600">حاضر</span>
              ) : participant.attendance_status === 'absent' ? (
                <span className="text-red-600">غائب</span>
              ) : participant.attendance_status === 'confirmed' ? (
                <span className="text-blue-600">مؤكد</span>
              ) : (
                <span className="text-gray-500">معلق</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
