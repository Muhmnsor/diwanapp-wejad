
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { MeetingParticipantsTable } from './MeetingParticipantsTable';
import { Skeleton } from '@/components/ui/skeleton';

interface MinutesParticipantsListProps {
  meetingId: string;
}

export const MinutesParticipantsList: React.FC<MinutesParticipantsListProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error } = useMeetingParticipants(meetingId);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">حدث خطأ أثناء تحميل المشاركين: {(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-4">
        <MeetingParticipantsTable 
          participants={participants || []} 
          allowDelete={false}
          showActions={false}
        />
      </CardContent>
    </Card>
  );
};
