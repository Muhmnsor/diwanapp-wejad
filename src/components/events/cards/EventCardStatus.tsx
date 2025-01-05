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
    <div className={`${status.color} text-white px-2 py-1 rounded-md text-sm flex items-center gap-1 mt-2`}>
      {status.text}
    </div>
  );
};