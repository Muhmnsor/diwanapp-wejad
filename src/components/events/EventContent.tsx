import { useState, useEffect } from "react";
import { Event } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";
import { getEventStatus } from "@/utils/eventUtils";

interface EventContentProps {
  event: Event;
  onRegister: () => void;
  isProject?: boolean;
}

export const EventContent = ({ event, onRegister, isProject = false }: EventContentProps) => {
  const [eventStatus, setEventStatus] = useState(() => 
    isProject ? 'available' : getEventStatus(event)
  );

  useEffect(() => {
    if (!isProject) {
      const newStatus = getEventStatus(event);
      setEventStatus(newStatus);
    }
  }, [event, isProject]);

  const handleRegister = () => {
    if (eventStatus === 'available') {
      onRegister();
    }
  };

  // Format dates for projects
  const formattedDates = isProject ? {
    date: event.start_date,
    endDate: event.end_date,
    registrationStartDate: event.registration_start_date,
    registrationEndDate: event.registration_end_date
  } : null;

  return (
    <div className="bg-white rounded-b-2xl shadow-sm">
      <div className="px-8 py-6">
        <EventInfo
          date={isProject ? formattedDates?.date : event.date}
          endDate={isProject ? formattedDates?.endDate : undefined}
          time={event.time}
          location={event.location}
          location_url={event.location_url}
          attendees={event.attendees}
          maxAttendees={event.max_attendees}
          eventType={event.event_type}
          price={event.price}
          beneficiaryType={event.beneficiary_type}
          certificateType={event.certificate_type}
          eventHours={event.event_hours}
          eventPath={event.event_path}
          eventCategory={event.event_category}
          showBadges={true}
          isProject={isProject}
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