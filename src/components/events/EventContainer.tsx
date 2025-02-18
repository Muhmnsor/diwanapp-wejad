import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { EventRegistrationDialog } from "./registration/dialogs/EventRegistrationDialog";
import { EventContent } from "./EventContent";
import { EventDescription } from "./EventDescription";
import { EventBadges } from "./badges/EventBadges";
import { EventRegisterButton } from "./EventRegisterButton";
import { Event } from "@/store/eventStore";
import { EventStatus } from "@/types/eventStatus";
import { getEventStatus } from "@/utils/eventUtils";

interface EventContainerProps {
  event: Event;
  id: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToCalendar?: () => void;
}

export const EventContainer = ({
  event,
  id,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
}: EventContainerProps) => {
  const [showRegistration, setShowRegistration] = useState(false);
  const eventStatus = getEventStatus(event);

  console.log('🎯 EventContainer - Event:', {
    id,
    title: event.title,
    location: event.location,
    location_url: event.location_url
  });

  const handleRegister = () => {
    setShowRegistration(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-6 space-y-6">
        <EventContent event={event} onRegister={handleRegister} />

        <div className="py-8 px-[30px]">
          <EventBadges 
            eventType={event.event_type}
            price={event.price}
            beneficiaryType={event.beneficiary_type}
            certificateType={event.certificate_type}
            eventHours={event.event_hours}
          />
        </div>

        <div className="py-8">
          <EventDescription description={event.description} />
        </div>

        <div className="px-8 py-6">
          <EventRegisterButton 
            status={eventStatus} 
            onRegister={handleRegister}
          />
        </div>
      </div>

      <EventRegistrationDialog
        event={event}
        showDialog={showRegistration}
        onClose={() => setShowRegistration(false)}
        onSubmit={handleSubmit}
      />
    </Card>
  );
};
