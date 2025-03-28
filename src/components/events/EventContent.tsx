
import { Event } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";
import { EventBadges } from "./badges/EventBadges";
import { useEffect, useState } from "react";
import { getEventStatus } from "@/utils/eventUtils";
import { useRegistrations } from "@/hooks/useRegistrations";

interface EventContentProps {
  event: Event;
  onRegister: () => void;
}

export const EventContent = ({
  event,
  onRegister
}: EventContentProps) => {
  const {
    data: registrationCounts
  } = useRegistrations();
  
  const [eventStatus, setEventStatus] = useState(() => getEventStatus(event));

  useEffect(() => {
    const currentAttendees = registrationCounts?.[event.id] || 0;
    console.log('Event data in content updated:', {
      title: event.title,
      date: event.date,
      registrationDates: {
        start: event.registrationStartDate,
        end: event.registrationEndDate
      },
      attendees: currentAttendees,
      maxAttendees: event.max_attendees,
      certificateType: event.certificate_type,
      eventHours: event.event_hours,
      beneficiaryType: event.beneficiary_type,
      eventType: event.event_type,
      price: event.price,
      location_url: event.location_url,
      eventPath: event.event_path,
      eventCategory: event.event_category
    });

    const newStatus = getEventStatus({
      ...event,
      attendees: currentAttendees
    });
    console.log('Event status updated to:', newStatus);
    setEventStatus(newStatus);
  }, [
    event.date, 
    event.registrationStartDate, 
    event.registrationEndDate, 
    event.max_attendees, 
    event.certificate_type, 
    event.event_hours, 
    event.beneficiary_type, 
    event.event_type, 
    event.price, 
    event.id, 
    registrationCounts
  ]);

  return (
    <div className="bg-white rounded-lg divide-y divide-gray-100" dir="rtl">
      <div className="py-8 px-[30px]">
        <EventBadges 
          eventType={event.event_type} 
          price={event.price} 
          beneficiaryType={event.beneficiary_type} 
          certificateType={event.certificate_type} 
          eventHours={event.event_hours} 
        />
      </div>

      <div className="py-8 px-8">
        <EventInfo 
          date={event.date} 
          time={event.time} 
          location={event.location} 
          location_url={event.location_url}
          attendees={registrationCounts?.[event.id] || 0} 
          maxAttendees={event.max_attendees} 
          eventType={event.event_type} 
          price={event.price} 
          beneficiaryType={event.beneficiary_type} 
          certificateType={event.certificate_type} 
          eventHours={event.event_hours}
          eventPath={event.event_path}
          eventCategory={event.event_category}
          showBadges={false} 
        />
      </div>

      <div className="py-8">
        <EventDescription description={event.description} />
      </div>

      <div className="px-8 py-6">
        <EventRegisterButton status={eventStatus} onRegister={onRegister} />
      </div>
    </div>
  );
};
