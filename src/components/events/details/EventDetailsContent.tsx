import { EventType } from "@/types/event";
import { EventInfo } from "../EventInfo";
import { EventDescription } from "../EventDescription";
import { EventRegisterButton } from "../EventRegisterButton";
import { getEventStatus } from "@/utils/eventUtils";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Award, Clock } from "lucide-react";

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

  const getCertificateLabel = (type?: string) => {
    switch (type) {
      case 'attendance':
        return 'شهادة حضور';
      case 'certified':
        return 'شهادة معتمدة';
      default:
        return '';
    }
  };

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
      <div className="px-8 py-4">
        {event.certificateType && event.certificateType !== 'none' && (
          <Badge variant="outline" className="flex items-center gap-1 mb-2">
            <Award className="w-3 h-3" />
            {getCertificateLabel(event.certificateType)}
          </Badge>
        )}
        {event.eventHours && event.eventHours > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {event.eventHours} ساعات
          </Badge>
        )}
      </div>

      <EventInfo
        date={event.date}
        time={event.time}
        location={event.location}
        attendees={event.attendees}
        maxAttendees={event.maxAttendees}
        eventType={event.eventType}
        price={event.price}
        beneficiaryType={event.beneficiaryType}
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