
import { Badge } from "@/components/ui/badge";
import { DecisionStatus } from "@/types/meeting";

interface DecisionStatusBadgeProps {
  status: DecisionStatus;
}

export const DecisionStatusBadge = ({ status }: DecisionStatusBadgeProps) => {
  const getStatusDetails = (status: DecisionStatus) => {
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
