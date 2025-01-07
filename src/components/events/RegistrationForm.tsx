import { FormEvent } from "react";
import { RegistrationFormContainer } from "./registration/form/RegistrationFormContainer";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (e: FormEvent) => void;
}

export const RegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit
}: RegistrationFormProps) => {
  return (
    <RegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={onSubmit}
    />
  );
};