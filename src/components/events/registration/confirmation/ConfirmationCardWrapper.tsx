import { ConfirmationCard } from "../../ConfirmationCard";

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
    <ConfirmationCard
      eventTitle={eventTitle}
      registrationId={registrationId}
      formData={formData}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSave={onSave}
    />
  );
};