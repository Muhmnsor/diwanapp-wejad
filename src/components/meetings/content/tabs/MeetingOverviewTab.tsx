
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Meeting } from '@/types/meeting';
import { formatDateWithDay, formatTime12Hour } from '@/utils/dateTimeUtils';

interface MeetingOverviewTabProps {
  meeting: Meeting;
  meetingId: string;
}

export const MeetingOverviewTab: React.FC<MeetingOverviewTabProps> = ({ meeting, meetingId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تفاصيل الاجتماع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">عنوان الاجتماع</p>
              <p className="font-semibold">{meeting.title}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">نوع الاجتماع</p>
              <p className="font-semibold">
                {meeting.meeting_type === 'board' && 'مجلس الإدارة'}
                {meeting.meeting_type === 'department' && 'اجتماع إدارة'}
                {meeting.meeting_type === 'team' && 'اجتماع فريق'}
                {meeting.meeting_type === 'committee' && 'اجتماع لجنة'}
                {meeting.meeting_type === 'other' && 'أخرى'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">تاريخ الاجتماع</p>
              <p className="font-semibold">{formatDateWithDay(meeting.date)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">وقت البدء</p>
              <p className="font-semibold">{formatTime12Hour(meeting.start_time)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">المدة (بالدقائق)</p>
              <p className="font-semibold">{meeting.duration} دقيقة</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">حالة الاجتماع</p>
              <p className="font-semibold">
                {meeting.meeting_status === 'scheduled' && 'مجدول'}
                {meeting.meeting_status === 'in_progress' && 'قيد التنفيذ'}
                {meeting.meeting_status === 'completed' && 'مكتمل'}
                {meeting.meeting_status === 'cancelled' && 'ملغي'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">نوع الحضور</p>
              <p className="font-semibold">
                {meeting.attendance_type === 'in_person' && 'حضوري'}
                {meeting.attendance_type === 'virtual' && 'عن بُعد'}
                {meeting.attendance_type === 'hybrid' && 'مختلط'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">المجلد</p>
              <p className="font-semibold">{meeting.folder_name || 'لا يوجد'}</p>
            </div>
            {meeting.location && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">الموقع</p>
                <p className="font-semibold">{meeting.location}</p>
              </div>
            )}
            {meeting.meeting_link && (
              <div className="space-y-2 col-span-2">
                <p className="text-sm text-muted-foreground">رابط الاجتماع</p>
                <a 
                  href={meeting.meeting_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline font-semibold"
                >
                  {meeting.meeting_link}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {meeting.objectives && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أهداف الاجتماع</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{meeting.objectives}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
