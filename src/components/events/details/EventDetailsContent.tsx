import { EventType } from "@/types/event";
import { EventInfo } from "../EventInfo";
import { EventDescription } from "../EventDescription";
import { EventRegisterButton } from "../EventRegisterButton";
import { getEventStatus } from "@/utils/eventUtils";
import { useEffect, useState } from "react";

interface EventDetailsContentProps {
  event: EventType;
  onRegister: () => void;
}

export const EventDetailsContent = ({ event, onRegister }: EventDetailsContentProps) => {
  const [eventStatus, setEventStatus] = useState(() => getEventStatus(event));

  useEffect(() => {
    console.log('Event data in details content updated:', {
      title: event.title,
      date: event.date,
      registrationDates: {
        start: event.registrationStartDate,
        end: event.registrationEndDate
      },
      certificate: {
        type: event.certificateType,
        hours: event.eventHours
      }
    });

    const newStatus = getEventStatus(event);
    console.log('New event status:', newStatus);
    setEventStatus(newStatus);
  }, [
    event.date, 
    event.registrationStartDate, 
    event.registrationEndDate,
    event.certificateType,
    event.eventHours
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
    <div className="bg-white rounded-b-2xl shadow-sm">
      <div className="px-8 py-6">
        <EventInfo
          date={event.date}
          time={event.time}
          location={event.location}
          attendees={event.attendees}
          maxAttendees={event.maxAttendees}
          eventType={event.eventType}
          price={event.price}
          beneficiaryType={event.beneficiaryType}
          certificateType={event.certificateType}
          eventHours={event.eventHours}
        />

        <EventDescription description={event.description} />

        <div className="mt-8">
          <EventRegisterButton 
            status={eventStatus}
            onRegister={handleRegister}
          />
        </div>
      </div>
    </div>
  );
};