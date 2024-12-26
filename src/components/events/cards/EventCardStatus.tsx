import { Badge } from "@/components/ui/badge";

interface EventCardStatusProps {
  maxAttendees: number;
  status: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "accent";
    color: string;
  };
}

export const EventCardStatus = ({
  status
}: EventCardStatusProps) => {
  return (
    <div className="flex justify-end">
      <Badge variant={status.variant} className="text-sm">
        {status.text}
      </Badge>
    </div>
  );
};