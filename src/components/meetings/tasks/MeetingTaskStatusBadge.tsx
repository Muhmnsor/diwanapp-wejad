
import React from "react";
import { Badge } from "@/components/ui/badge";

interface MeetingTaskStatusBadgeProps {
  status: string;
}

export const MeetingTaskStatusBadge: React.FC<MeetingTaskStatusBadgeProps> = ({ status }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" = "default";
  let label = "قيد الانتظار";

  switch (status) {
    case "pending":
      variant = "default";
      label = "قيد الانتظار";
      break;
    case "in_progress":
      variant = "secondary";
      label = "قيد التنفيذ";
      break;
    case "completed":
      variant = "success";
      label = "مكتملة";
      break;
    case "cancelled":
      variant = "destructive";
      label = "ملغاة";
      break;
    default:
      variant = "outline";
      label = status;
  }

  return <Badge variant={variant}>{label}</Badge>;
};
