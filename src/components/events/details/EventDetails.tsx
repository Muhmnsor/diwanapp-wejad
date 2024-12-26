import { CalendarDays, Clock, MapPin, Monitor, Users } from "lucide-react";
import { formatTime12Hour, formatDateWithDay } from "@/utils/dateTimeUtils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: registrations } = useQuery({
    queryKey: ['registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', window.location.pathname.split('/').pop());

      if (error) {
        console.error('Error fetching registrations:', error);
        return [];
      }

      console.log('Fetched registrations:', data);
      return data;
    }
  });

  const attendeesCount = registrations?.length || 0;
  
  console.log('EventDetails - Current attendees:', attendeesCount);
  console.log('EventDetails - Max attendees:', maxAttendees);
  
  const formattedDate = formatDateWithDay(date);
  const formattedTime = formatTime12Hour(time);

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
          {`${attendeesCount} من ${maxAttendees} مشارك`}
        </span>
      </div>
    </div>
  );
};