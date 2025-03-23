
import React from "react";
import { Badge } from "@/components/ui/badge";
import { TaskStatus } from "@/types/meeting";

interface MeetingTaskStatusBadgeProps {
  status: TaskStatus;
}

export const MeetingTaskStatusBadge: React.FC<MeetingTaskStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return { variant: "secondary" as const, label: "قيد الانتظار" };
      case "in_progress":
        return { variant: "default" as const, label: "قيد التنفيذ" };
      case "completed":
        return { variant: "success" as const, label: "مكتملة" };
      case "cancelled":
        return { variant: "destructive" as const, label: "ملغاة" };
      default:
        return { variant: "secondary" as const, label: "غير معروف" };
    }
  };

  const { variant, label } = getStatusConfig();

  return <Badge variant={variant}>{label}</Badge>;
};
