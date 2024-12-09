import { CalendarDays, Clock, MapPin, Users, Monitor, Ticket, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventInfoProps {
  date: string;
  time: string;
  location: string;
  attendees: number;
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
  const remainingSeats = maxAttendees - attendees;
  
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
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Clock className="h-5 w-5 text-primary" />
          <span>{time}</span>
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
            {attendees} مشارك 
            {remainingSeats > 0 && ` (متبقي ${remainingSeats} مقعد)`}
          </span>
        </div>
      </div>
    </div>
  );
};