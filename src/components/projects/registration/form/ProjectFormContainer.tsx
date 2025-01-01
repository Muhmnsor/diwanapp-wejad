import { FormEvent, useState } from "react";
import { ProjectRegistrationForm } from "../ProjectRegistrationForm";
import { useRegistrationFields } from "../hooks/useRegistrationFields";
import { LoadingState, ErrorState } from "@/components/events/registration/components/RegistrationFormStates";
import { ProjectRegistrationFormData } from "../types/registration";

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
  const [formData, setFormData] = useState<ProjectRegistrationFormData>({
    arabicName: "",
    englishName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract project ID from URL or pass it as prop if needed
  const projectId = window.location.pathname.split('/').pop();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProjectRegistrationForm
      projectTitle={projectTitle}
      projectPrice={projectPrice}
      startDate={startDate}
      endDate={endDate}
      formData={formData}
      setFormData={setFormData}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      registrationFields={registrationFields}
    />
  );
};