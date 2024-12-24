import { Event } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";
import { getEventStatus } from "@/utils/eventUtils";
import { useEffect, useState } from "react";

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
      maxAttendees: event.maxAttendees
    });

    // تحديث حالة الزر عندما تتغير بيانات الفعالية
    const newStatus = getEventStatus(event);
    console.log('New event status:', newStatus);
    setEventStatus(newStatus);
  }, [
    event.date, 
    event.registrationStartDate, 
    event.registrationEndDate,
    event.attendees,
    event.maxAttendees
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