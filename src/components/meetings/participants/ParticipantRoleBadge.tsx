
import { Badge } from "@/components/ui/badge";
import { ParticipantRole } from "@/types/meeting";

interface ParticipantRoleBadgeProps {
  role: ParticipantRole;
}

export const ParticipantRoleBadge = ({ role }: ParticipantRoleBadgeProps) => {
  switch (role) {
    case "organizer":
      return <Badge className="bg-blue-100 text-blue-800">منظم</Badge>;
    case "presenter":
      return <Badge className="bg-green-100 text-green-800">مقدم</Badge>;
    case "member":
      return <Badge className="bg-gray-100 text-gray-800">عضو</Badge>;
    case "guest":
      return <Badge className="bg-purple-100 text-purple-800">ضيف</Badge>;
    default:
      return <Badge>{role}</Badge>;
  }
};
