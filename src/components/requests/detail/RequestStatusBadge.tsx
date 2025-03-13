
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
    case 'rejected':
      return <Badge variant="destructive">مرفوض</Badge>;
    case 'cancelled':
      return <Badge variant="outline" className="bg-gray-200">ملغي</Badge>;
    case 'in_execution':
      return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">قيد التنفيذ</Badge>;
    case 'executed':
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700">تم التنفيذ</Badge>;
    case 'implementation_complete':
      return <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">اكتمل التنفيذ</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
