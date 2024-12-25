import { EventType } from "@/types/event";
import { EventInfo } from "../EventInfo";
import { EventDescription } from "../EventDescription";
import { EventRegisterButton } from "../EventRegisterButton";
import { getEventStatus } from "@/utils/eventUtils";

interface EventDetailsContentProps {
  event: EventType;
  onRegister: () => void;
}

export const EventDetailsContent = ({ event, onRegister }: EventDetailsContentProps) => {
  const handleRegister = () => {
    const status = getEventStatus(event);
    if (status === 'available') {
      onRegister();
    }
  };

  const eventStatus = getEventStatus(event);

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