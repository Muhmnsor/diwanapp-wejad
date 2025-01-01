import { FormEvent } from "react";
import { ProjectRegistrationFields } from "./fields/ProjectRegistrationFields";
import { ProjectRegistrationButton } from "./components/ProjectRegistrationButton";
import { ProjectRegistrationFormData } from "./types/registration";

interface ProjectRegistrationFormProps {
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
}

export const ProjectRegistrationForm = ({
  projectTitle,
  projectPrice,
  startDate,
  endDate,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
}: ProjectRegistrationFormProps) => {
  console.log('ProjectRegistrationForm - Current form data:', formData);
  
  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ProjectRegistrationFields
        formData={formData}
        setFormData={setFormData}
        projectPrice={projectPrice}
        showPaymentFields={isPaidProject}
      />
      
      <ProjectRegistrationButton
        isSubmitting={isSubmitting}
        isPaidProject={isPaidProject}
        projectPrice={projectPrice}
      />
    </form>
  );
};