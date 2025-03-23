
import React from 'react';
import { MeetingObjectives } from './MeetingObjectives';
import { MeetingAgendaItems } from './MeetingAgendaItems';
import { Card, CardContent } from '@/components/ui/card';
import { useMeeting } from '@/hooks/meetings/useMeeting';
import { Clock, Calendar, MapPin, Users, Link } from 'lucide-react';

interface MeetingDetailsTabProps {
  meetingId: string;
}

export const MeetingDetailsTab = ({ meetingId }: MeetingDetailsTabProps) => {
  const { data: meeting, isLoading, error } = useMeeting(meetingId);

  if (isLoading) {
    return <div className="py-4">جاري تحميل تفاصيل الاجتماع...</div>;
  }

  if (error) {
    return <div className="py-4 text-red-500">حدث خطأ أثناء تحميل تفاصيل الاجتماع</div>;
  }

  if (!meeting) {
    return <div className="py-4">لا يوجد بيانات للاجتماع</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">معلومات الاجتماع</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5 ml-2" />
              <div>
                <p className="text-sm text-gray-500">التاريخ</p>
                <p>{meeting.date}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5 ml-2" />
              <div>
                <p className="text-sm text-gray-500">الوقت</p>
                <p>{meeting.start_time}</p>
              </div>
            </div>
            
            {meeting.location && (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5 ml-2" />
                <div>
                  <p className="text-sm text-gray-500">المكان</p>
                  <p>{meeting.location}</p>
                </div>
              </div>
            )}
            
            {meeting.meeting_link && (
              <div className="flex items-start">
                <Link className="h-5 w-5 text-gray-500 mt-0.5 ml-2" />
                <div>
                  <p className="text-sm text-gray-500">رابط الاجتماع</p>
                  <p>
                    <a 
                      href={meeting.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {meeting.meeting_link}
                    </a>
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <Users className="h-5 w-5 text-gray-500 mt-0.5 ml-2" />
              <div>
                <p className="text-sm text-gray-500">نوع الحضور</p>
                <p>
                  {meeting.attendance_type === 'in_person' && 'حضوري'}
                  {meeting.attendance_type === 'virtual' && 'افتراضي'}
                  {meeting.attendance_type === 'hybrid' && 'مختلط'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5 ml-2" />
              <div>
                <p className="text-sm text-gray-500">المدة</p>
                <p>{meeting.duration} دقيقة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Include the meeting objectives and agenda sections */}
      <MeetingObjectives meetingId={meetingId} />
      <MeetingAgendaItems meetingId={meetingId} />
    </div>
  );
};
