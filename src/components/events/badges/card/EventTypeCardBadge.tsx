import { Badge } from "@/components/ui/badge";

interface EventTypeCardBadgeProps {
  eventType: "online" | "in-person";
}

export const EventTypeCardBadge = ({ eventType }: EventTypeCardBadgeProps) => {
  return (
    <Badge 
      variant={eventType === "online" ? "secondary" : "default"}
      className={`${eventType === "online" ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'bg-[#0EA5E9] border-[#0EA5E9] text-white'} border`}
    >
      {eventType === "online" ? "عن بعد" : "حضوري"}
    </Badge>
  );
};