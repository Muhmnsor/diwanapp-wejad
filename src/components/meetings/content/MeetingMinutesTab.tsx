
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MeetingMinutesTabProps {
  meetingId: string;
}

export const MeetingMinutesTab = ({ meetingId }: MeetingMinutesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>محضر الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          سيتم تطوير هذا القسم لاحقاً لعرض وإدارة محضر الاجتماع
        </p>
      </CardContent>
    </Card>
  );
};
