import { FormEvent } from "react";
import { ProjectRegistrationForm } from "../ProjectRegistrationForm";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { LoadingState, ErrorState } from "@/components/events/registration/components/RegistrationFormStates";

interface ProjectFormContainerProps {
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  onSubmit: (e: FormEvent) => void;
}

export const ProjectFormContainer = ({
  projectTitle,
  projectPrice,
  startDate,
  endDate,
  onSubmit
}: ProjectFormContainerProps) => {
  const { data: registrationFields, isLoading, error } = useRegistrationFields();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    console.error('Error loading registration fields:', error);
    return <ErrorState error={error} />;
  }

  if (!registrationFields) {
    return <ErrorState error={new Error('No registration fields configuration found')} />;
  }

  return (
    <ProjectRegistrationForm
      projectTitle={projectTitle}
      projectPrice={projectPrice}
      startDate={startDate}
      endDate={endDate}
      registrationFields={registrationFields}
      onSubmit={onSubmit}
    />
  );
};