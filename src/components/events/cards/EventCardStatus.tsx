import { Badge } from "@/components/ui/badge";

interface EventCardStatusProps {
  maxAttendees: number;
  status: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "accent";
    color: string;
    textColor: string;
  };
}

export const EventCardStatus = ({
  status
}: EventCardStatusProps) => {
  return (
    <div className="flex">
      <div className={`px-3 py-1 rounded-full text-sm ${status.color} ${status.textColor}`}>
        {status.text}
      </div>
    </div>
  );
};