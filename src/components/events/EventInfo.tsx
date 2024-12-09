import { CalendarDays, Clock, MapPin, Users, Monitor, Ticket, CreditCard } from "lucide-react";
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
  // Handle attendees count whether it's a number or an array
  const attendeesCount = Array.isArray(attendees) ? attendees.length : attendees;
  const remainingSeats = maxAttendees - attendeesCount;
  
  // تنسيق التاريخ والوقت
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3 text-gray-600">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="h-5 w-5 text-primary" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          {eventType === "online" ? (
            <Monitor className="h-5 w-5 text-primary" />
          ) : (
            <MapPin className="h-5 w-5 text-primary" />
          )}
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Users className="h-5 w-5 text-primary" />
          <span>
            {attendeesCount} مشارك 
            {remainingSeats > 0 && ` (متبقي ${remainingSeats} مقعد)`}
          </span>
        </div>
      </div>
    </div>
  );
};