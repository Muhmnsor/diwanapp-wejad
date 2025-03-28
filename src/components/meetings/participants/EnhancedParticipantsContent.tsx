
import React from 'react';
import { useMeetingParticipants } from '@/hooks/meetings/useMeetingParticipants';
import { MeetingParticipantsTable } from './MeetingParticipantsTable';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedParticipantsContentProps {
  meetingId: string;
}

export const EnhancedParticipantsContent: React.FC<EnhancedParticipantsContentProps> = ({ meetingId }) => {
  const { data: participants, isLoading, error } = useMeetingParticipants(meetingId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error || !participants) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          حدث خطأ أثناء تحميل بيانات المشاركين
        </div>
      </Card>
    );
  }

  if (participants.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          لا يوجد مشاركين في هذا الاجتماع
        </div>
      </Card>
    );
  }

  return <MeetingParticipantsTable participants={participants} meetingId={meetingId} />;
};
