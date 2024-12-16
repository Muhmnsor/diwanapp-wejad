import { Event } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";
import { getEventStatus } from "@/utils/eventUtils";

interface EventContentProps {
  event: Event;
  onRegister: () => void;
}

export const EventContent = ({ event, onRegister }: EventContentProps) => {
  const handleRegister = () => {
    const status = getEventStatus(event);
    console.log('Current event status:', status);
    if (status === 'available') {
      onRegister();
    }
  };

  const eventStatus = getEventStatus(event);
  console.log('Event status in content:', eventStatus);

  return (
    <div className="p-8 border-t border-gray-100">
      <EventInfo
        date={event.date}
        time={event.time}
        location={event.location}
        attendees={event.attendees}
        maxAttendees={event.maxAttendees}
        eventType={event.eventType}
        price={event.price}
      />

      <EventDescription description={event.description} />

      <EventRegisterButton 
        status={eventStatus}
        onRegister={handleRegister}
      />
    </div>
  );
};