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
      <div 
        className={`
          px-4 py-1.5 
          rounded-full 
          text-sm 
          font-medium
          shadow-sm
          border
          transition-all
          duration-200
          ${status.color} 
          ${status.textColor}
          hover:opacity-90
        `}
      >
        {status.text}
      </div>
    </div>
  );
};