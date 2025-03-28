
import { Badge } from "@/components/ui/badge";

interface RequestStatusBadgeProps {
  status: string;
}

export const RequestStatusBadge = ({ status }: RequestStatusBadgeProps) => {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">مسودة</Badge>;
    case 'pending':
      return <Badge variant="secondary">قيد الانتظار</Badge>;
    case 'in_progress':
      return <Badge variant="default">قيد المعالجة</Badge>;
    case 'approved':
      return <Badge variant="success">تمت الموافقة</Badge>;
    case 'completed': // Handle legacy 'completed' status as 'approved'
      return <Badge variant="success">تمت الموافقة</Badge>;
    case 'rejected':
      return <Badge variant="destructive">مرفوض</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-gray-200">ملغي</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
