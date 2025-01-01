import { FormEvent } from "react";
import { ProjectRegistrationForm } from "./ProjectRegistrationForm";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { LoadingState, ErrorState } from "@/components/events/registration/components/RegistrationFormStates";

interface ProjectFormContainerProps {
  projectId: string;
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
}

export const ProjectFormContainer = ({
  projectId,
  projectTitle,
  projectPrice,
  startDate,
  endDate,
  formData,
  setFormData,
  isSubmitting,
  onSubmit
}: ProjectFormContainerProps) => {
  const { data: registrationFields, isLoading, error } = useRegistrationFields(projectId);

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
      formData={formData}
      setFormData={setFormData}
      isSubmitting={isSubmitting}
      projectPrice={projectPrice}
      registrationFields={registrationFields}
      onSubmit={onSubmit}
    />
  );
};