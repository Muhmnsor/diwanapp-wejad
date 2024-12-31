import { EventConfirmationCard } from "@/components/events/confirmation/EventConfirmationCard";

interface ProjectConfirmationCardProps {
  eventTitle: string;
  projectTitle?: string;
  registrationId: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  eventDetails?: {
    date?: string;
    time?: string;
    location?: string;
  };
}

export const ProjectConfirmationCard = ({
  eventTitle,
  projectTitle,
  registrationId,
  formData,
  eventDetails
}: ProjectConfirmationCardProps) => {
  return (
    <EventConfirmationCard
      eventTitle={projectTitle || eventTitle}
      registrationId={registrationId}
      registrantInfo={formData}
      eventDetails={eventDetails}
    />
  );
};