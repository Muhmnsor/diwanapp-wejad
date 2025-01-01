import { FormEvent } from "react";
import { ProjectRegistrationFields } from "../fields/ProjectRegistrationFields";
import { ProjectRegistrationButton } from "../components/ProjectRegistrationButton";
import { ProjectRegistrationFormData } from "../types/registration";

interface ProjectRegistrationFormProps {
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  isSubmitting: boolean;
  projectPrice: number | "free" | null;
  registrationFields: {
    arabic_name: boolean;
    email: boolean;
    phone: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
  onSubmit: (e: FormEvent) => void;
}

export const ProjectRegistrationForm = ({
  formData,
  setFormData,
  isSubmitting,
  projectPrice,
  registrationFields,
  onSubmit
}: ProjectRegistrationFormProps) => {
  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ProjectRegistrationFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
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