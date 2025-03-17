
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types/meeting";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800">قيد التنفيذ</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800">ملغي</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
