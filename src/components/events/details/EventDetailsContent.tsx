
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
  const [eventStatus, setEventStatus] = useState(() => getEventStatus({
    ...event,
    max_attendees: event.max_attendees
  }));

  useEffect(() => {
    console.log('Event data in details content:', {
      title: event.title,
      date: event.date,
      registrationDates: {
        start: event.registrationStartDate,
        end: event.registrationEndDate
      },
      attendees: event.attendees,
      maxAttendees: event.max_attendees,
      eventPath: event.event_path,
      eventCategory: event.event_category
    });

    const newStatus = getEventStatus({
      ...event,
      max_attendees: event.max_attendees
    });
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
    const status = getEventStatus({
      ...event,
      max_attendees: event.max_attendees
    });
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
          location_url={event.location_url}
          attendees={event.attendees}
          maxAttendees={event.max_attendees}
          eventType={event.eventType}
          price={event.price}
          beneficiaryType={event.beneficiaryType}
          certificateType={event.certificateType}
          eventHours={event.eventHours}
          eventPath={event.event_path}
          eventCategory={event.event_category}
          showBadges={true}
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
