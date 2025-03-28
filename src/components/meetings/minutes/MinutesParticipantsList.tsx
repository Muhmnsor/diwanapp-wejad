
import React from 'react';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MeetingParticipantRoleBadge } from '../participants/MeetingParticipantRoleBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface MinutesParticipantsListProps {
  meetingId: string;
}

export const MinutesParticipantsList: React.FC<MinutesParticipantsListProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error } = useMeetingParticipants(meetingId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>المشاركون في الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !participants) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>المشاركون في الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            حدث خطأ أثناء تحميل بيانات المشاركين
          </div>
        </CardContent>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>المشاركون في الاجتماع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            لا يوجد مشاركين في هذا الاجتماع
          </div>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>المشاركون في الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الصفة</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>حالة الحضور</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
