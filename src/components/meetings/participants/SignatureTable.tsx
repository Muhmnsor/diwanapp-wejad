
import React, { useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { ParticipantRole } from '@/types/meeting';

interface SignatureTableProps {
  meetingId: string;
}

export const SignatureTable: React.FC<SignatureTableProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error } = useMeetingParticipants(meetingId);

  useEffect(() => {
    console.log('SignatureTable - meetingId:', meetingId);
    console.log('SignatureTable - participants:', participants);
    if (error) {
      console.error('SignatureTable - error loading participants:', error);
    }
  }, [meetingId, participants, error]);

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

  // Filter and sort participants:
  // 1. Only include chairman and members
  // 2. Sort with chairman first, then members
  const filteredParticipants = participants
    .filter(p => p.role === 'chairman' || p.role === 'member')
    .sort((a, b) => {
      if (a.role === 'chairman') return -1;
      if (b.role === 'chairman') return 1;
      return 0;
    });

  if (filteredParticipants.length === 0) {
    return <div className="py-4 text-center text-gray-500">لا يوجد رئيس أو أعضاء في هذا الاجتماع</div>;
  }

  console.log('Rendering signature table with participants:', filteredParticipants);

  return (
    <div className="mt-8 border rounded-md">
      <h3 className="p-4 font-medium text-lg border-b bg-muted/30">توقيعات الحضور</h3>
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">الاسم</TableHead>
            <TableHead className="w-1/2">التوقيع</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredParticipants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell>
                <div>
                  <span className="font-medium">{participant.user_display_name}</span>
                  <div className="text-sm text-gray-500">
                    {participant.title && (
                      <span>{participant.title}</span>
                    )}
                    {!participant.title && participant.role === 'chairman' && (
                      <span>(الرئيس)</span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="h-16 align-top">
                <div className="h-12 border-b border-dashed border-gray-400"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
