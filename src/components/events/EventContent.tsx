import { Event } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";
import { EventBadges } from "./badges/EventBadges";
import { useEffect, useState } from "react";
import { getEventStatus } from "@/utils/eventUtils";

interface EventContentProps {
  event: Event;
  onRegister: () => void;
}

export const EventContent = ({ event, onRegister }: EventContentProps) => {
  const [eventStatus, setEventStatus] = useState(() => getEventStatus(event));

  useEffect(() => {
    console.log('Event data in content updated:', {
      title: event.title,
      date: event.date,
      registrationDates: {
        start: event.registrationStartDate,
        end: event.registrationEndDate
      },
      attendees: event.attendees,
      maxAttendees: event.max_attendees,
      certificateType: event.certificateType,
      eventHours: event.eventHours
    });

    const newStatus = getEventStatus(event);
    console.log('Event status updated to:', newStatus);
    setEventStatus(newStatus);
  }, [
    event.date, 
    event.registrationStartDate, 
    event.registrationEndDate,
    event.attendees,
    event.max_attendees
  ]);

  const handleRegister = () => {
    const status = getEventStatus(event);
    console.log('Attempting registration with status:', status);
    
    if (status === 'available') {
      console.log('Registration allowed, proceeding...');
      onRegister();
    } else {
      console.log('Registration not allowed for status:', status);
    }
  };

  return (
    <div className="bg-white rounded-lg divide-y divide-gray-100" dir="rtl">
      <div className="py-8">
        <EventBadges
          eventType={event.event_type}
          price={event.price}
          beneficiaryType={event.beneficiaryType}
          certificateType={event.certificate_type}
          eventHours={event.event_hours}
        />
      </div>

      <div className="py-8 px-8">
        <EventInfo
          date={event.date}
          time={event.time}
          location={event.location}
          attendees={event.attendees}
          maxAttendees={event.max_attendees}
          eventType={event.event_type}
          price={event.price}
          beneficiaryType={event.beneficiaryType}
          certificateType={event.certificate_type}
          eventHours={event.event_hours}
          showBadges={false}
        />
      </div>

      <div className="py-8">
        <EventDescription description={event.description} />
      </div>

      <div className="px-8 py-6">
        <EventRegisterButton 
          status={eventStatus}
          onRegister={handleRegister}
        />
      </div>
    </div>
  );
};