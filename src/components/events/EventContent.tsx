import { Event } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";
import { useEffect, useState } from "react";
import { getEventStatus } from "@/utils/eventUtils";

interface EventContentProps {
  event: Event;
  onRegister: () => void;
}

export const EventContent = ({ event, onRegister }: EventContentProps) => {
  const [eventStatus, setEventStatus] = useState(() => getEventStatus(event));

  useEffect(() => {
    if (!event) {
      console.error('EventContent - Critical: No event data provided');
      return;
    }

    console.log('EventContent received event data:', {
      id: event.id,
      title: event.title,
      date: event.date,
      eventPath: event.event_path,
      eventCategory: event.event_category,
      attendees: event.attendees,
      maxAttendees: event.max_attendees
    });

    const newStatus = getEventStatus(event);
    setEventStatus(newStatus);
  }, [event]);

  if (!event) {
    console.log('No event data provided to EventContent');
    return null;
  }

  return (
    <div className="bg-white rounded-lg divide-y divide-gray-100" dir="rtl">
      <div className="px-8 py-6">
        <EventInfo
          date={event.date}
          time={event.time}
          location={event.location}
          location_url={event.location_url}
          attendees={event.attendees}
          maxAttendees={event.max_attendees}
          eventType={event.event_type || event.eventType}
          price={event.price}
          beneficiaryType={event.beneficiary_type || event.beneficiaryType}
          certificateType={event.certificate_type || event.certificateType}
          eventHours={event.event_hours || event.eventHours}
          eventPath={event.event_path}
          eventCategory={event.event_category}
        />

        <div className="mt-8">
          <EventDescription description={event.description} />
        </div>

        <div className="mt-8">
          <EventRegisterButton 
            status={eventStatus}
            onRegister={onRegister}
          />
        </div>
      </div>
    </div>
  );
};