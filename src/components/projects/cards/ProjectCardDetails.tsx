import { CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ProjectCardDetailsProps {
  start_date: string;
  end_date: string;
  attendees: number;
  maxAttendees: number;
}

export const ProjectCardDetails = ({
  start_date,
  end_date,
  attendees,
  maxAttendees,
}: ProjectCardDetailsProps) => {
  const formatDate = (date: string) => {
    return format(new Date(date), "d MMMM yyyy", { locale: ar });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <CalendarDays className="w-4 h-4" />
        <span>
          {formatDate(start_date)} - {formatDate(end_date)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <Users className="w-4 h-4" />
        <span>
          {attendees} / {maxAttendees} مشارك
        </span>
      </div>
    </div>
  );
};