
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900">
          مكتملة
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900">
          قيد التنفيذ
        </Badge>
      );
    case "delayed":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900">
          متأخرة
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900">
          قيد الانتظار
        </Badge>
      );
  }
};
