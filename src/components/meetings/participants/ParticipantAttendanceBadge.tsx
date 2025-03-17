
import { Badge } from "@/components/ui/badge";
import { AttendanceStatus } from "@/types/meeting";

interface ParticipantAttendanceBadgeProps {
  status: AttendanceStatus;
}

export const ParticipantAttendanceBadge = ({ status }: ParticipantAttendanceBadgeProps) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="border-yellow-300 text-yellow-700">قيد الانتظار</Badge>;
    case "confirmed":
      return <Badge variant="outline" className="border-blue-300 text-blue-700">مؤكد</Badge>;
    case "attended":
      return <Badge variant="outline" className="border-green-300 text-green-700">حضر</Badge>;
    case "absent":
      return <Badge variant="outline" className="border-red-300 text-red-700">متغيب</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
