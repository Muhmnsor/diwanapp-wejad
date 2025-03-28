
import React from 'react';
import { MinutesParticipantsList } from './MinutesParticipantsList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ParticipantDialogBridge } from './ParticipantDialogBridge';

interface MeetingMinutesParticipantsSectionProps {
  meetingId: string;
  showHeader?: boolean;
  showAddButton?: boolean;
}

export const MeetingMinutesParticipantsSection: React.FC<MeetingMinutesParticipantsSectionProps> = ({
  meetingId,
  showHeader = true,
  showAddButton = true
}) => {
  return (
    <Card className="mb-6">
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">المشاركون في الاجتماع</CardTitle>
          {showAddButton && (
            <ParticipantDialogBridge 
              meetingId={meetingId}
              buttonVariant="outline"
              buttonSize="sm"
            />
          )}
        </CardHeader>
      )}
      <CardContent className="pt-0">
        <MinutesParticipantsList meetingId={meetingId} />
      </CardContent>
    </Card>
  );
};
