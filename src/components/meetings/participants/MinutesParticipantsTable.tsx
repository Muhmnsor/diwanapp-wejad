
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { Badge } from '@/components/ui/badge';

interface MinutesParticipantsTableProps {
  meetingId: string;
}

export const MinutesParticipantsTable: React.FC<MinutesParticipantsTableProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error } = useMeetingParticipants(meetingId);

  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">جاري تحميل بيانات المشاركين...</div>;
  }

  if (error) {
    console.error('Error loading participants:', error);
    return <div className="py-4 text-center text-gray-500">حدث خطأ أثناء تحميل بيانات المشاركين</div>;
  }

  if (!participants || participants.length === 0) {
    return <div className="py-4 text-center text-gray-500">لا يوجد مشاركين في هذا الاجتماع</div>;
  }

  // Sort participants by role priority
  const sortedParticipants = [...participants].sort((a, b) => {
    const getRolePriority = (role: string) => {
      switch (role) {
        case 'chairman': return 1;
        case 'secretary': return 2;
        case 'member': return 3;
        case 'observer': return 4;
        default: return 5;
      }
    };
    return getRolePriority(a.role) - getRolePriority(b.role);
  });

  return (
    <div className="mt-8 border rounded-md">
      <h3 className="p-4 font-medium text-lg border-b bg-muted/30">قائمة المشاركين</h3>
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">الاسم</TableHead>
            <TableHead className="w-1/4">الصفة</TableHead>
            <TableHead className="w-1/4">الدور</TableHead>
            <TableHead className="w-1/4">الحالة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParticipants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell>
                <span className="font-medium">{participant.user_display_name}</span>
              </TableCell>
              <TableCell>
                {participant.title || '-'}
              </TableCell>
              <TableCell>
                <MeetingParticipantRoleBadge role={participant.role} />
              </TableCell>
              <TableCell>
                <AttendanceStatusBadge status={participant.attendance_status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper component for attendance status badges
const AttendanceStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'confirmed':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">تم التأكيد</Badge>;
    case 'attended':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">حضر</Badge>;
    case 'absent':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">غائب</Badge>;
    case 'pending':
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">معلق</Badge>;
  }
};
