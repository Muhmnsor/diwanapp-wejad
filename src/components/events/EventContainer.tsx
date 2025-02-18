import { useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { EventRegistrationDialog } from "./registration/dialogs/EventRegistrationDialog";
import { EventContent } from "./EventContent";
import { EventHeader } from "./EventHeader";
import { EventInfo } from "./EventInfo";
import { EventDescription } from "./EventDescription";
import { EventBadges } from "./badges/EventBadges";
import { EventRegisterButton } from "./EventRegisterButton";
import { EventFooter } from "./EventFooter";
import { Event } from "@/store/eventStore";
import { useAuthStore } from "@/store/authStore";
import { useRegistrationCheck } from "@/hooks/useRegistrationCheck";

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
  const { user } = useAuthStore();
  const { isRegistered } = useRegistrationCheck(id, user?.id);

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
      <EventHeader event={event} />
      
      <div className="p-6 space-y-6">
        <EventContent>
          <EventInfo event={event} />
          <EventBadges event={event} />
          <EventDescription description={event.description} />
        </EventContent>

        <EventRegisterButton
          isRegistered={isRegistered}
          onClick={handleRegister}
          registrationDates={{
            start: event.registration_start_date,
            end: event.registration_end_date
          }}
        />

        <EventFooter
          event={event}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddToCalendar={onAddToCalendar}
        />
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
