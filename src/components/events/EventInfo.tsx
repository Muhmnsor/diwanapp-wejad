import { CalendarDays, Clock, MapPin, Users, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime12Hour, formatDateWithDay } from "@/utils/dateTimeUtils";

interface EventInfoProps {
  date: string;
  time: string;
  location: string;
  attendees: number | Array<any>;
  maxAttendees: number;
  eventType: "online" | "in-person";
  price: number | "free";
}

export const EventInfo = ({ 
  date, 
  time, 
  location, 
  attendees, 
  maxAttendees,
  eventType,
  price 
}: EventInfoProps) => {
  const attendeesCount = Array.isArray(attendees) ? attendees.length : attendees;
  const remainingSeats = maxAttendees - attendeesCount;
  
  const formattedDate = formatDateWithDay(date);
  const formattedTime = formatTime12Hour(time);
  
  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap gap-2">
        <Badge variant={eventType === "online" ? "secondary" : "default"}>
          {eventType === "online" ? "عن بعد" : "حضوري"}
        </Badge>
        <Badge variant={price === "free" ? "secondary" : "default"}>
          {price === "free" ? "مجاني" : `${price} ريال`}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary shrink-0" />
          <span className="text-gray-600">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary shrink-0" />
          <span className="text-gray-600">{formattedTime}</span>
        </div>
        <div className="flex items-center gap-3">
          {eventType === "online" ? (
            <Monitor className="h-5 w-5 text-primary shrink-0" />
          ) : (
            <MapPin className="h-5 w-5 text-primary shrink-0" />
          )}
          <span className="text-gray-600">{location}</span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary shrink-0" />
          <span className="text-gray-600">
            {attendeesCount} مشارك 
            {remainingSeats > 0 && ` (متبقي ${remainingSeats} مقعد)`}
          </span>
        </div>
      </div>
    </div>
  );
};