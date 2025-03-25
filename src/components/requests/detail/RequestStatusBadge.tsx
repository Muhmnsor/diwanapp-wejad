
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface RequestStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="secondary">قيد الانتظار</Badge>;
    case 'approved':
      return <Badge variant="success">تمت الموافقة</Badge>;
    case 'rejected':
      return <Badge variant="destructive">مرفوض</Badge>;
    default:
      return <Badge>غير معروف</Badge>;
  }
};
