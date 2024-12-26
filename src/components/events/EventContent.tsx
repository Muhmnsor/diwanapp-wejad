import { Event } from "@/store/eventStore";
import { EventBadges } from "./badges/EventBadges";
import { Button } from "../ui/button";
import { getEventStatus } from "@/utils/eventUtils";

interface EventContentProps {
  event: Event;
  onRegister: () => void;
}

export const EventContent = ({ event, onRegister }: EventContentProps) => {
  const status = getEventStatus(event);
  const isRegistrationOpen = status === 'open';

  return (
    <div className="p-6 space-y-6">
      <EventBadges
        eventType={event.event_type}
        price={event.price}
        beneficiaryType={event.beneficiary_type}
        certificateType={event.certificate_type}
        eventHours={event.event_hours}
      />
      
      <div className="space-y-4">
        <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
        
        {isRegistrationOpen && (
          <Button 
            onClick={onRegister}
            className="w-full"
          >
            التسجيل في الفعالية
          </Button>
        )}
      </div>
    </div>
  );
};