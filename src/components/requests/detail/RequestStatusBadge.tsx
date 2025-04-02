
import React from "react";
import { Badge } from "@/components/ui/badge";

interface RequestStatusBadgeProps {
  status: string;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let colorClass = "";

  switch (status) {
    case "completed":
    case "approved":
      variant = "outline";
      colorClass = "bg-green-50 text-green-700 hover:bg-green-50";
      break;
    case "pending":
      variant = "outline";
      colorClass = "bg-blue-50 text-blue-700 hover:bg-blue-50";
      break;
    case "rejected":
      variant = "outline";
      colorClass = "bg-red-50 text-red-700 hover:bg-red-50";
      break;
    case "in-progress":
      variant = "outline";
      colorClass = "bg-amber-50 text-amber-700 hover:bg-amber-50";
      break;
    default:
      variant = "outline";
      colorClass = "bg-gray-50 text-gray-700 hover:bg-gray-50";
  }

  return (
    <Badge variant={variant} className={colorClass}>
      {getStatusText(status)}
    </Badge>
  );
}

function getStatusText(status: string): string {
  switch (status) {
    case "completed":
      return "مكتمل";
    case "approved":
      return "معتمد";
    case "pending":
      return "معلق";
    case "rejected":
      return "مرفوض";
    case "in-progress":
      return "قيد التنفيذ";
    default:
      return status;
  }
}
