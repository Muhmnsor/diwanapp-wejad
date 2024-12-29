import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getEventStatus } from "@/utils/eventUtils";
import { useEffect } from "react";
import { EventCardContent } from "./events/cards/EventCardContent";
import { getRegistrationStatusConfig } from "@/utils/eventStatusUtils";
import { useRegistrations } from "@/hooks/useRegistrations";
import { EyeOff } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | "free" | null;  // Updated to match Event type
  max_attendees?: number;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  beneficiary_type: string;
  certificate_type?: string;
  event_hours?: number;
  is_visible?: boolean;
  className?: string;
  onEdit?: () => void;
}

export const EventCard = ({ 
  id, 
  title, 
  date, 
  location, 
  image_url, 
  event_type, 
  price,
  max_attendees = 0,
  registration_start_date,
  registration_end_date,
  beneficiary_type,
  certificate_type = 'none',
  event_hours = 0,
  is_visible = true,
  className = "",
  onEdit
}: EventCardProps) => {
  const { data: registrationCounts } = useRegistrations();
  const currentAttendees = registrationCounts?.[id] || 0;
  
  const status = getEventStatus({
    date,
    time: "00:00",
    max_attendees,
    registrationStartDate: registration_start_date,
    registrationEndDate: registration_end_date,
    beneficiaryType: beneficiary_type,
    attendees: currentAttendees
  } as any);

  const statusConfig = getRegistrationStatusConfig(status);

  useEffect(() => {
    console.log('EventCard data:', {
      title,
      certificate: {
        type: certificate_type,
        hours: event_hours
      },
      max_attendees,
      currentAttendees,
      registrationDates: {
        start: registration_start_date,
        end: registration_end_date
      },
      beneficiaryType: beneficiary_type,
      status,
      isVisible: is_visible
    });
  }, [title, certificate_type, event_hours, max_attendees, registration_start_date, registration_end_date, beneficiary_type, currentAttendees, status, is_visible]);

  return (
    <div className={`w-[380px] sm:w-[460px] lg:w-[480px] mx-auto relative ${className}`} dir="rtl">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in h-full">
        <img src={image_url} alt={title} className="w-full h-40 object-cover" />
        {!is_visible && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
            <EyeOff className="w-4 h-4" />
            مخفي
          </div>
        )}
        <CardHeader className="p-4">
          <CardTitle className="text-lg line-clamp-2 text-right">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EventCardContent
            date={date}
            location={location}
            eventType={event_type}
            price={price}
            beneficiaryType={beneficiary_type}
            certificateType={certificate_type}
            eventHours={event_hours}
            maxAttendees={max_attendees}
            status={statusConfig}
          />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button asChild className="flex-1" size="sm">
            <Link to={`/events/${id}`}>عرض التفاصيل</Link>
          </Button>
          {onEdit && (
            <Button onClick={onEdit} variant="outline" size="sm">
              تعديل
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};