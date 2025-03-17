
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MeetingParticipant } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, User, UserCircle } from 'lucide-react';

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
            email
          )
        `)
        .eq('meeting_id', meetingId);

      if (error) throw error;
      return data as MeetingParticipant[];
    },
    enabled: !!meetingId,
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">جاري تحميل المشاركين...</div>;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'chairman':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">رئيس الجلسة</Badge>;
      case 'secretary':
        return <Badge className="bg-green-100 text-green-800 border-green-200">سكرتير</Badge>;
      case 'member':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">عضو</Badge>;
      case 'observer':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">مراقب</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      case 'declined':
        return <UserX className="h-5 w-5 text-red-500" />;
      case 'attended':
        return <UserCircle className="h-5 w-5 text-blue-500" />;
      case 'pending':
      default:
        return <User className="h-5 w-5 text-gray-500" />;
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
            لا يوجد مشاركين في هذا الاجتماع
          </div>
        ) : (
          <ul className="space-y-4">
            {participants.map((participant) => (
              <li key={participant.id} className="border rounded-md p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3">
                    {getAttendanceIcon(participant.attendance_status)}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {participant.user?.display_name || participant.user?.email || 'مستخدم غير معروف'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {participant.user?.email}
                    </p>
                  </div>
                </div>
                <div>
                  {getRoleBadge(participant.role)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
