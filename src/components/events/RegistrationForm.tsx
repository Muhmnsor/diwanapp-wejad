
import { FormEvent } from "react";
import { RegistrationFormContainer } from "./registration/form/RegistrationFormContainer";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  location_url?: string;
  onSubmit: (e: FormEvent) => void;
}

export const RegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  location_url,
  onSubmit
}: RegistrationFormProps) => {
  return (
    <RegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      location_url={location_url}
      onSubmit={onSubmit}
    />
  );
};
