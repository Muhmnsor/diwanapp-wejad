
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types/meeting";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export const TaskStatusBadge = ({ status }: TaskStatusBadgeProps) => {
  const getStatusDetails = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return { label: "قيد الانتظار", variant: "outline" as const };
      case "in_progress":
        return { label: "قيد التنفيذ", variant: "secondary" as const };
      case "completed":
        return { label: "مكتمل", variant: "default" as const };
      case "cancelled":
        return { label: "ملغي", variant: "destructive" as const };
      default:
        return { label: status, variant: "outline" as const };
    }
  };

  const { label, variant } = getStatusDetails(status);

  return (
    <Badge variant={variant}>{label}</Badge>
  );
};
