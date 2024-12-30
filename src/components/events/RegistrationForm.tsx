import { RegistrationFormContainer } from "./form/RegistrationFormContainer";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
  isProject?: boolean;
}

export const RegistrationForm = ({ 
  eventTitle, 
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isProject = false
}: RegistrationFormProps) => {
  return (
    <RegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={onSubmit}
      isProject={isProject}
    />
  );
};