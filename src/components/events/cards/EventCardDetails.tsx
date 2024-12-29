import { CalendarDays } from "lucide-react";

interface EventCardDetailsProps {
  date: string;
  end?: string;
  location?: string;
  attendees: number;
  maxAttendees: number;
}

export const EventCardDetails = ({ date, end, location, attendees, maxAttendees }: EventCardDetailsProps) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <CalendarDays size={16} />
        <span>{end ? `${date} - ${end}` : date}</span>
      </div>
      <div className="flex items-center justify-between text-gray-600 text-sm">
        <span>المسجلين</span>
        <span>{attendees} / {maxAttendees}</span>
      </div>
    </div>
  );
};