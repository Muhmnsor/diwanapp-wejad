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
    console.log('Attempting registration with status:', status);
    
    if (status === 'available') {
      console.log('Registration allowed, proceeding...');
      onRegister();
    } else {
      console.log('Registration not allowed for status:', status);
    }
  };

  const eventStatus = getEventStatus(event);
  console.log('Event status in content:', eventStatus);

  return (
    <div className="bg-white">
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

      <div className="px-8 pb-8">
        <EventRegisterButton 
          status={eventStatus}
          onRegister={handleRegister}
        />
      </div>
    </div>
  );
};