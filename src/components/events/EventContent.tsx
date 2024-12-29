import { Event } from "@/store/eventStore";
import { EventDescription } from "./EventDescription";
import { EventInfo } from "./EventInfo";
import { EventRegisterButton } from "./EventRegisterButton";
import { formatDateWithDay } from "@/utils/dateTimeUtils";
import { formatTime12Hour } from "@/utils/dateTimeUtils";
import { getEventStatus } from "@/utils/eventUtils";
import { useRegistrations } from "@/hooks/useRegistrations";
import { EventStatus } from "@/types/eventStatus";

interface EventContentProps {
  event: Event;
  onRegister?: () => void;
  isProject?: boolean;
}

export const EventContent = ({ event, onRegister, isProject = false }: EventContentProps) => {
  const { data: registrationCounts } = useRegistrations();
  const currentAttendees = registrationCounts?.[event.id || ''] || 0;

  const status = getEventStatus({
    date: event.date,
    time: event.time,
    max_attendees: event.max_attendees,
    registrationStartDate: event.registration_start_date,
    registrationEndDate: event.registration_end_date,
    beneficiaryType: event.beneficiary_type,
    attendees: currentAttendees
  });

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return formatDateWithDay(date);
  };

  return (
    <div className="p-6 space-y-6">
      <EventDescription description={event.description} />
      
      <EventInfo
        date={isProject ? `من ${formatDate(event.start_date)} إلى ${formatDate(event.end_date)}` : formatDate(event.date)}
        time={isProject ? undefined : formatTime12Hour(event.time)}
        location={event.location}
        eventType={event.event_type}
        price={event.price}
        maxAttendees={event.max_attendees}
        currentAttendees={currentAttendees}
        beneficiaryType={event.beneficiary_type}
        certificateType={event.certificate_type}
        eventHours={event.event_hours}
        locationUrl={event.location_url}
        status={status}
        isProject={isProject}
      />

      {onRegister && (
        <EventRegisterButton
          onRegister={onRegister}
          status={status}
          isProject={isProject}
        />
      )}
    </div>
  );
};