
import { Badge } from "@/components/ui/badge";
import { AttendanceStatus } from "@/types/meeting";

interface ParticipantAttendanceBadgeProps {
  status: AttendanceStatus;
}

export const ParticipantAttendanceBadge = ({ status }: ParticipantAttendanceBadgeProps) => {
  const variants: Record<AttendanceStatus, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    pending: { label: "في الانتظار", variant: "outline" },
    confirmed: { label: "مؤكد", variant: "secondary" },
    attended: { label: "حضر", variant: "default" },
    absent: { label: "غائب", variant: "destructive" }
  };

  const { label, variant } = variants[status] || variants.pending;

  return (
    <Badge variant={variant}>{label}</Badge>
  );
};
