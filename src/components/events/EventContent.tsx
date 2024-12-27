import { Event } from "@/store/eventStore";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventRegisterButton } from "./EventRegisterButton";
import { EventBadges } from "./badges/EventBadges";
import { useEffect, useState } from "react";
import { getEventStatus } from "@/utils/eventUtils";
import { useRegistrations } from "@/hooks/useRegistrations";
import { toast } from "sonner";

interface EventContentProps {
  event: Event;
  onRegister: () => void;
}

export const EventContent = ({ event, onRegister }: EventContentProps) => {
  const { data: registrationCounts, isError: isRegistrationsError } = useRegistrations();
  const [eventStatus, setEventStatus] = useState(() => getEventStatus(event));

  useEffect(() => {
    if (!event) {
      console.error('EventContent - Critical: No event data provided');
      toast.error("حدث خطأ في تحميل بيانات الفعالية");
      return;
    }

    const currentAttendees = registrationCounts?.[event.id] || 0;
    
    console.log('EventContent - Event data loaded:', {
      id: event.id,
      title: event.title,
      date: event.date,
      registrationDates: {
        start: event.registrationStartDate || event.registration_start_date,
        end: event.registrationEndDate || event.registration_end_date
      },
      attendees: currentAttendees,
      maxAttendees: event.max_attendees,
      certificateType: event.certificate_type || event.certificateType,
      eventHours: event.event_hours || event.eventHours,
      beneficiaryType: event.beneficiary_type || event.beneficiaryType,
      eventType: event.event_type || event.eventType,
      price: event.price,
      location_url: event.location_url
    });

    if (isRegistrationsError) {
      console.error('EventContent - Error fetching registrations data');
      toast.error("حدث خطأ في تحميل بيانات التسجيلات");
    }

    const newStatus = getEventStatus({
      ...event,
      attendees: currentAttendees
    });
    
    console.log('EventContent - Status updated:', {
      previousStatus: eventStatus,
      newStatus: newStatus,
      attendees: currentAttendees,
      maxAttendees: event.max_attendees
    });

    setEventStatus(newStatus);
  }, [
    event?.id,
    event?.date, 
    event?.registrationStartDate, 
    event?.registrationEndDate,
    event?.registration_start_date,
    event?.registration_end_date,
    event?.max_attendees,
    event?.certificate_type,
    event?.certificateType,
    event?.event_hours,
    event?.eventHours,
    event?.beneficiary_type,
    event?.beneficiaryType,
    event?.event_type,
    event?.eventType,
    event?.price,
    registrationCounts,
    isRegistrationsError,
    eventStatus
  ]);

  if (!event) {
    console.error('EventContent - Rendering failed: No event data available');
    return null;
  }

  return (
    <div className="bg-white rounded-lg divide-y divide-gray-100" dir="rtl">
      <div className="py-8">
        <EventBadges
          eventType={event.event_type || event.eventType}
          price={event.price}
          beneficiaryType={event.beneficiary_type || event.beneficiaryType}
          certificateType={event.certificate_type || event.certificateType}
          eventHours={event.event_hours || event.eventHours}
        />
      </div>

      <div className="py-8 px-8">
        <EventInfo
          date={event.date}
          time={event.time}
          location={event.location}
          location_url={event.location_url}
          attendees={registrationCounts?.[event.id] || 0}
          maxAttendees={event.max_attendees}
          eventType={event.event_type || event.eventType}
          price={event.price}
          beneficiaryType={event.beneficiary_type || event.beneficiaryType}
          certificateType={event.certificate_type || event.certificateType}
          eventHours={event.event_hours || event.eventHours}
          showBadges={false}
          eventPath={event.event_path}
          eventCategory={event.event_category}
        />
      </div>

      <div className="py-8">
        <EventDescription description={event.description} />
      </div>

      <div className="px-8 py-6">
        <EventRegisterButton 
          status={eventStatus}
          onRegister={onRegister}
        />
      </div>
    </div>
  );
};