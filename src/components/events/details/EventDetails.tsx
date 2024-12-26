import { CalendarDays, Clock, MapPin, Monitor, Users } from "lucide-react";
import { formatTime12Hour, formatDateWithDay } from "@/utils/dateTimeUtils";

interface EventDetailsProps {
  date: string;
  time: string;
  location: string;
  eventType: "online" | "in-person";
  attendees: number | Array<any>;
  maxAttendees: number;
}

export const EventDetails = ({
  date,
  time,
  location,
  eventType,
  attendees,
  maxAttendees = 0
}: EventDetailsProps) => {
  const attendeesCount = Array.isArray(attendees) ? attendees.length : attendees || 0;
  const remainingSeats = maxAttendees - attendeesCount;
  
  console.log('EventDetails - Current attendees:', attendeesCount);
  console.log('EventDetails - Max attendees:', maxAttendees);
  console.log('EventDetails - Remaining seats:', remainingSeats);
  
  const formattedDate = formatDateWithDay(date);
  const formattedTime = formatTime12Hour(time);

  const getSeatsText = () => {
    if (!maxAttendees) return "لا توجد مقاعد متاحة";
    if (attendeesCount === 0) return `${maxAttendees} مقعد متاح`;
    const text = `${attendeesCount} من ${maxAttendees} مقعد`;
    if (remainingSeats > 0) return `${text} (متبقي ${remainingSeats} مقعد)`;
    return text;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
          <CalendarDays className="h-5 w-5 text-primary" />
        </div>
        <span className="text-[#1A1F2C]">{formattedDate}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <span className="text-[#1A1F2C]">{formattedTime}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
          {eventType === "online" ? (
            <Monitor className="h-5 w-5 text-primary" />
          ) : (
            <MapPin className="h-5 w-5 text-primary" />
          )}
        </div>
        <span className="text-[#1A1F2C]">{location}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <span className="text-[#1A1F2C]" dir="rtl">
          {getSeatsText()}
        </span>
      </div>
    </div>
  );
};