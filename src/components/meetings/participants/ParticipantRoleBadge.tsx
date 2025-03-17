
import { Badge } from "@/components/ui/badge";
import { ParticipantRole } from "@/types/meeting";

interface ParticipantRoleBadgeProps {
  role: ParticipantRole;
}

export const ParticipantRoleBadge = ({ role }: ParticipantRoleBadgeProps) => {
  const variants: Record<ParticipantRole, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    organizer: { label: "منظم", variant: "default" },
    presenter: { label: "مقدم", variant: "secondary" },
    member: { label: "عضو", variant: "outline" },
    guest: { label: "ضيف", variant: "outline" }
  };

  const { label, variant } = variants[role] || variants.member;

  return (
    <Badge variant={variant}>{label}</Badge>
  );
};
