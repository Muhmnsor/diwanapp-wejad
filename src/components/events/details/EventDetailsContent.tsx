import { EventType } from "@/types/event";
import { EventInfo } from "../EventInfo";
import { EventDescription } from "../EventDescription";
import { EventRegisterButton } from "../EventRegisterButton";
import { getEventStatus } from "@/utils/eventUtils";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

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

  const getBeneficiaryLabel = (type: string) => {
    switch (type) {
      case 'men':
        return 'رجال';
      case 'women':
        return 'نساء';
      default:
        return 'رجال ونساء';
    }
  };

  return (
    <div className="bg-white rounded-b-2xl shadow-sm">
      <div className="px-8 py-6">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge variant={event.eventType === "online" ? "secondary" : "default"} className="rounded-full px-4 py-1">
            {event.eventType === "online" ? "عن بعد" : "حضوري"}
          </Badge>
          <Badge variant="outline" className="rounded-full px-4 py-1">
            {event.price === "free" ? "مجاني" : `${event.price} ريال`}
          </Badge>
          <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-1">
            <Users className="w-4 h-4" />
            {getBeneficiaryLabel(event.beneficiaryType)}
          </Badge>
        </div>

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