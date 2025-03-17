
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { MeetingParticipant } from '../types';

interface MeetingParticipantsPanelProps {
  meetingId: string;
}

export const MeetingParticipantsPanel = ({ meetingId }: MeetingParticipantsPanelProps) => {
  const { data: participants = [], isLoading } = useQuery({
    queryKey: ['meeting-participants', meetingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
          *,
          user:user_id (
            display_name,
            email,
            avatar_url
          )
        `)
        .eq('meeting_id', meetingId)
        .order('role');

      if (error) throw error;
      return data as MeetingParticipant[];
    },
    enabled: !!meetingId,
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل المشاركين...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">حاضر</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 border-red-200">معتذر</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">معلق</Badge>;
    }
  };

  const getAttendanceStatusBadge = (attendance_status: string) => {
    switch (attendance_status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 border-green-200">حاضر</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 border-red-200">غائب</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">متأخر</Badge>;
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">معذور</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">غير مسجل</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'organizer':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">منظم</Badge>;
      case 'secretary':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">أمين السر</Badge>;
      case 'participant':
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">مشارك</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>المشاركون في الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            لا يوجد مشاركون في هذا الاجتماع
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar>
                    <AvatarImage src={participant.user?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{participant.user?.display_name || participant.user?.email}</p>
                    <p className="text-sm text-muted-foreground">{participant.user?.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getRoleBadge(participant.role)}
                  {getStatusBadge(participant.status)}
                  {participant.attendance_status && getAttendanceStatusBadge(participant.attendance_status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
