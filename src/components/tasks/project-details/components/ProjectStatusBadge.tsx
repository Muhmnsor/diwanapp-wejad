
import { Badge } from "@/components/ui/badge";

interface ProjectStatusBadgeProps {
  status: string;
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  let badgeClass = "";
  let statusText = "";

  switch (status) {
    case "planned":
      badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
      statusText = "مخطط";
      break;
    case "in_progress":
      badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
      statusText = "قيد التنفيذ";
      break;
    case "completed":
      badgeClass = "bg-green-100 text-green-800 border-green-200";
      statusText = "مكتمل";
      break;
    case "on_hold":
      badgeClass = "bg-purple-100 text-purple-800 border-purple-200";
      statusText = "معلق";
      break;
    case "cancelled":
      badgeClass = "bg-red-100 text-red-800 border-red-200";
      statusText = "ملغي";
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800 border-gray-200";
      statusText = status || "غير محدد";
  }

  return (
    <Badge
      variant="outline"
      className={`px-3 py-1 h-9 border ${badgeClass} rounded-md font-medium text-sm whitespace-nowrap`}
    >
      {statusText}
    </Badge>
  );
};
