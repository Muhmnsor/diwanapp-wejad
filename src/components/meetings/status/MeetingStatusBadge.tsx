
import React from "react";
import { Badge } from "@/components/ui/badge";
import { MeetingStatus } from "@/types/meeting";

interface MeetingStatusBadgeProps {
  status: MeetingStatus;
}

export const MeetingStatusBadge = ({ status }: MeetingStatusBadgeProps) => {
  switch (status) {
    case "scheduled":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200">
          مجدول
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200">
          جاري التنفيذ
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200">
          مكتمل
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200">
          ملغي
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200">
          {status}
        </Badge>
      );
  }
};
