
import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskPriorityBadgeProps {
  priority: string;
}

export const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "low":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getPriorityText = (priority: string) => {
  switch (priority) {
    case "high":
      return "عالية";
    case "medium":
      return "متوسطة";
    case "low":
      return "منخفضة";
    default:
      return "غير محددة";
  }
};

export const TaskPriorityBadge = ({ priority }: TaskPriorityBadgeProps) => {
  return (
    <Badge className={`text-xs flex items-center gap-1 ${getPriorityVariant(priority)}`}>
      <Flag className="h-3 w-3" />
      {getPriorityText(priority)}
    </Badge>
  );
};
