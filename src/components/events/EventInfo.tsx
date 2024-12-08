import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

interface EventInfoProps {
  date: string;
  time: string;
  location: string;
  attendees: number;
}

export const EventInfo = ({ date, time, location, attendees }: EventInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="flex items-center gap-3 text-gray-600">
        <CalendarDays className="h-5 w-5 text-primary" />
        <span>{date}</span>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <Clock className="h-5 w-5 text-primary" />
        <span>{time}</span>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <MapPin className="h-5 w-5 text-primary" />
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-3 text-gray-600">
        <Users className="h-5 w-5 text-primary" />
        <span>{attendees} مشارك</span>
      </div>
    </div>
  );
};