import { Event } from "@/store/eventStore";
import { EventDescription } from "./EventDescription";
import { EventInfo } from "./EventInfo";
import { EventRegisterButton } from "./EventRegisterButton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface EventContentProps {
  event: Event;
  onRegister?: () => void;
  isProject?: boolean;
}

export const EventContent = ({ event, onRegister, isProject = false }: EventContentProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy', { locale: ar });
  };

  const getProjectDates = () => {
    if (isProject && 'start_date' in event && 'end_date' in event) {
      return {
        start: formatDate(event.start_date),
        end: formatDate(event.end_date)
      };
    }
    return null;
  };

  const projectDates = getProjectDates();

  return (
    <div className="p-6 space-y-6">
      <EventDescription description={event.description} />
      
      {projectDates ? (
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">تاريخ البداية:</span> {projectDates.start}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">تاريخ النهاية:</span> {projectDates.end}
          </p>
        </div>
      ) : (
        <p className="text-gray-600">
          <span className="font-medium">التاريخ:</span>{" "}
          {formatDate(event.date)}
          {event.time && ` - ${event.time}`}
        </p>
      )}

      <EventInfo
        certificateType={event.certificate_type}
        eventHours={event.event_hours}
        eventType={event.event_type}
        price={event.price}
        beneficiaryType={event.beneficiary_type}
        location_url={event.location_url}
        eventPath={event.event_path}
        eventCategory={event.event_category}
      />

      {onRegister && (
        <EventRegisterButton
          event={event}
          onRegister={onRegister}
        />
      )}
    </div>
  );
};