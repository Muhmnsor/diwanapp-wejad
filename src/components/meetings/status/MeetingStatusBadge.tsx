
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { MeetingStatus } from '@/types/meeting';

// Define the allowed status types
type MeetingStatusBadgeProp = 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'scheduled' | 'in_progress';

interface MeetingStatusBadgeProps {
  status: MeetingStatusBadgeProp | MeetingStatus | string;
}

export const MeetingStatusBadge = ({ status }: MeetingStatusBadgeProps) => {
  // Default status if undefined
  const meetingStatus = status || 'upcoming';
  
  // Map any incoming status to the expected values
  let normalizedStatus = meetingStatus;
  if (meetingStatus === 'scheduled') normalizedStatus = 'upcoming';
  if (meetingStatus === 'in_progress') normalizedStatus = 'in-progress';
  
  switch (normalizedStatus) {
    case 'upcoming':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 mr-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>قادم</span>
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 mr-2">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>جاري</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 mr-2">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>مكتمل</span>
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 mr-2">
          <XCircle className="h-3 w-3 mr-1" />
          <span>ملغي</span>
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 mr-2">
          <Clock className="h-3 w-3 mr-1" />
          <span>قادم</span>
        </Badge>
      );
  }
};
