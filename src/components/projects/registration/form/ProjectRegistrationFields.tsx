import { ProjectPersonalInfoFields } from "./ProjectPersonalInfoFields";
import { ProjectEducationFields } from "./ProjectEducationFields";
import { PaymentFields } from "@/components/events/form/PaymentFields";

interface ProjectRegistrationFieldsProps {
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
  projectPrice: number | "free" | null;
}

export const ProjectRegistrationFields = ({
  formData,
  setFormData,
  projectPrice
}: ProjectRegistrationFieldsProps) => {
  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  return (
    <div className="space-y-4">
      <ProjectPersonalInfoFields
        formData={formData}
        setFormData={setFormData}
      />
      
      <ProjectEducationFields
        formData={formData}
        setFormData={setFormData}
      />
      
      {isPaidProject && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={projectPrice}
        />
      )}
    </div>
  );
};