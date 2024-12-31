import { EventConfirmationDialog } from "./confirmation/EventConfirmationDialog";
import { ProjectActivityConfirmationDialog } from "./confirmation/ProjectActivityConfirmationDialog";

interface RegistrationConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  eventPrice: number | "free";
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  isProjectActivity?: boolean;
  projectTitle?: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  onPayment: () => void;
}

export const RegistrationConfirmation = ({
  open,
  onOpenChange,
  registrationId,
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  isProjectActivity = false,
  projectTitle,
  formData,
  onPayment,
}: RegistrationConfirmationProps) => {
  console.log('RegistrationConfirmation - Rendering with props:', {
    isProjectActivity,
    projectTitle,
    registrationId,
    eventTitle,
    formData
  });
  
  if (isProjectActivity && projectTitle) {
    console.log('RegistrationConfirmation - Showing project activity confirmation');
    return (
      <ProjectActivityConfirmationDialog
        open={open}
        onOpenChange={onOpenChange}
        registrationId={registrationId}
        eventTitle={eventTitle}
        eventPrice={eventPrice}
        eventDate={eventDate}
        eventTime={eventTime}
        eventLocation={eventLocation}
        formData={formData}
        projectTitle={projectTitle}
        onPayment={onPayment}
      />
    );
  }

  console.log('RegistrationConfirmation - Showing event confirmation');
  return (
    <EventConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      registrationId={registrationId}
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      formData={formData}
      onPayment={onPayment}
    />
  );
};