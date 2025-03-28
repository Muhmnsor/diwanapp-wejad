
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MeetingStatus } from '@/types/meeting';

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
}

export const MeetingStatusBadge: React.FC<MeetingStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'scheduled':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">قادم</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">جاري حالياً</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">مكتمل</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">ملغي</Badge>;
    default:
      return <Badge>غير معروف</Badge>;
  }
};
