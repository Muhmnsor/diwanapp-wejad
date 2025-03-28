
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RequestStatus } from '@/types/meeting';

interface RequestStatusBadgeProps {
  status: RequestStatus | string;
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status }) => {
  // Normalize the status to handle any string type inputs
  const normalizedStatus = status as RequestStatus;
  
  switch (normalizedStatus) {
    case 'pending':
      return <Badge variant="secondary">قيد الانتظار</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">قيد التنفيذ</Badge>;
    case 'approved':
      return <Badge variant="success">تمت الموافقة</Badge>;
    case 'completed':
      return <Badge variant="success">مكتمل</Badge>;
    case 'rejected':
      return <Badge variant="destructive">مرفوض</Badge>;
    case 'cancelled':
      return <Badge variant="destructive" className="bg-gray-100 text-gray-800 hover:bg-gray-200">ملغي</Badge>;
    default:
      return <Badge>غير معروف</Badge>;
  }
};
