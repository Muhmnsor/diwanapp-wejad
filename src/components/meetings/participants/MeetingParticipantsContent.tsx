
import React, { useState, useEffect } from 'react';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { MeetingParticipantRoleBadge } from './MeetingParticipantRoleBadge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface MeetingParticipantsContentProps {
  meetingId: string;
  view?: 'full' | 'compact';
  onEdit?: (participantId: string) => void;
  onDelete?: (participantId: string) => void;
}

export const MeetingParticipantsContent: React.FC<MeetingParticipantsContentProps> = ({ 
  meetingId,
  view = 'full',
  onEdit, 
  onDelete 
}) => {
  const { data: participants, isLoading, isError, error } = useMeetingParticipants(meetingId);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        <span className="mr-3">جاري التحميل...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        حدث خطأ أثناء تحميل بيانات المشاركين: {error instanceof Error ? error.message : 'خطأ غير معروف'}
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        لم يتم إضافة أي مشاركين لهذا الاجتماع
      </div>
    );
  }

  // Determine which columns to show based on view
  const showActions = view === 'full' && (onEdit || onDelete);
  const showAttendanceStatus = view === 'full';
  const showTitle = view === 'full';
  const showPhone = view === 'full';

  return (
    <Table dir="rtl">
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead>الدور</TableHead>
          {showTitle && <TableHead>المسمى الوظيفي</TableHead>}
          {showPhone && <TableHead>رقم الهاتف</TableHead>}
          {showAttendanceStatus && <TableHead>حالة الحضور</TableHead>}
          {showActions && <TableHead>الإجراءات</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.id}>
            <TableCell>{participant.user_display_name}</TableCell>
            <TableCell>
              <MeetingParticipantRoleBadge role={participant.role} />
            </TableCell>
            {showTitle && <TableCell>{participant.title || 'غير محدد'}</TableCell>}
            {showPhone && <TableCell>{participant.phone || 'غير محدد'}</TableCell>}
            {showAttendanceStatus && (
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  participant.attendance_status === 'attended' 
                    ? 'bg-green-100 text-green-800' 
                    : participant.attendance_status === 'confirmed'
                    ? 'bg-blue-100 text-blue-800'
                    : participant.attendance_status === 'absent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {participant.attendance_status === 'attended' 
                    ? 'حضر' 
                    : participant.attendance_status === 'confirmed'
                    ? 'مؤكد'
                    : participant.attendance_status === 'absent'
                    ? 'غائب'
                    : 'معلق'}
                </span>
              </TableCell>
            )}
            {showActions && (
              <TableCell>
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(participant.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">تعديل</span>
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(participant.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-500 hover:border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">حذف</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
