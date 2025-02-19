
import { Card } from "@/components/ui/card";
import { getEventStatus } from "@/utils/eventUtils";
import { useEffect } from "react";
import { EventCardContent } from "./events/cards/EventCardContent";
import { getRegistrationStatusConfig } from "@/utils/eventStatusUtils";
import { useRegistrations } from "@/hooks/useRegistrations";
import { EventCardHeader } from "./events/cards/EventCardHeader";
import { EventCardImage } from "./events/cards/EventCardImage";
import { EventCardFooter } from "./events/cards/EventCardFooter";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image_url: string;
  event_type: "online" | "in-person";
  price: number | null;
  max_attendees?: number;
  registration_start_date?: string | null;
  registration_end_date?: string | null;
  beneficiary_type: string;
  certificate_type?: string;
  event_hours?: number;
  is_visible?: boolean;
  className?: string;
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
  className = ""
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
    <div className={`w-full max-w-[460px] mx-auto relative mb-4 ${className}`} dir="rtl">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in h-full">
        <EventCardImage 
          imageUrl={image_url}
          title={title}
          isVisible={is_visible}
        />
        <EventCardHeader title={title} />
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
        <EventCardFooter eventId={id} />
      </Card>
    </div>
  );
};
