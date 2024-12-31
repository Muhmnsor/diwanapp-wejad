import { EventConfirmationCard } from "../../confirmation/EventConfirmationCard";

interface ConfirmationCardWrapperProps {
  eventTitle: string;
  registrationId: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  onSave?: () => void;
}

export const ConfirmationCardWrapper = ({
  eventTitle,
  registrationId,
  formData,
  eventDate,
  eventTime,
  eventLocation,
  onSave
}: ConfirmationCardWrapperProps) => {
  console.log('ConfirmationCardWrapper - Rendering with props:', {
    eventTitle,
    registrationId,
    formData,
    eventDate,
    eventTime,
    eventLocation
  });

  return (
    <EventConfirmationCard
      eventTitle={eventTitle}
      registrationId={registrationId}
      registrantInfo={formData}
      eventDetails={{
        date: eventDate,
        time: eventTime,
        location: eventLocation
      }}
    />
  );
};