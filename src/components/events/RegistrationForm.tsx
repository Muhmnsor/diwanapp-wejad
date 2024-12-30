import { RegistrationFormContainer } from "./form/RegistrationFormContainer";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
}

export const RegistrationForm = ({ 
  eventTitle, 
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
}: RegistrationFormProps) => {
  console.log('Rendering event registration form for:', eventTitle);
  
  return (
    <RegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={onSubmit}
      isProject={false}
    />
  );
};