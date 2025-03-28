
import React from 'react';
import { MeetingParticipantsTable } from '../participants/MeetingParticipantsTable';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MinutesParticipantsListProps {
  meetingId: string;
}

export const MinutesParticipantsList: React.FC<MinutesParticipantsListProps> = ({ meetingId }) => {
  const { data: participants, isLoading } = useMeetingParticipants(meetingId);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">قائمة الحضور</CardTitle>
      </CardHeader>
      <CardContent>
        <MeetingParticipantsTable 
          participants={participants || []} 
          isLoading={isLoading} 
          showTitle={true}
        />
      </CardContent>
    </Card>
  );
};
