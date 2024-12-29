import { Badge } from "@/components/ui/badge";

interface ProjectTypeCardBadgeProps {
  type: "online" | "in-person";
}

export const ProjectTypeCardBadge = ({ type }: ProjectTypeCardBadgeProps) => {
  return (
    <Badge variant="secondary" className="rounded-md">
      {type === "online" ? "عن بعد" : "حضوري"}
    </Badge>
  );
};