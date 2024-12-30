import { ProjectRegistrationFields } from "./ProjectRegistrationFields";
import { ProjectRegistrationActions } from "./ProjectRegistrationActions";

interface ProjectRegistrationFormProps {
  formData: {
    email: string;
    phone: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    arabicName: string;
    englishName: string;
    educationLevel: string;
    birthDate: string;
    nationalId: string;
  };
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  projectPrice: number | "free" | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProjectRegistrationForm = ({
  formData,
  setFormData,
  isSubmitting,
  projectPrice,
  onSubmit
}: ProjectRegistrationFormProps) => {
  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <ProjectRegistrationFields
        formData={formData}
        setFormData={setFormData}
        projectPrice={projectPrice}
      />
      
      <ProjectRegistrationActions
        isSubmitting={isSubmitting}
        isPaidProject={isPaidProject}
        projectPrice={projectPrice}
      />
    </form>
  );
};