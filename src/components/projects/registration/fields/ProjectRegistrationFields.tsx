import { PersonalInfoFields } from "./PersonalInfoFields";
import { PaymentFields } from "./PaymentFields";
import { ProjectRegistrationFormData, ProjectRegistrationFieldsConfig } from "../types/registration";

interface ProjectRegistrationFieldsProps {
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  registrationFields: ProjectRegistrationFieldsConfig;
  projectPrice: number | "free" | null;
  showPaymentFields: boolean;
}

export const ProjectRegistrationFields = ({
  formData,
  setFormData,
  registrationFields,
  projectPrice,
  showPaymentFields
}: ProjectRegistrationFieldsProps) => {
  console.log('Project registration fields:', registrationFields);
  console.log('Form data:', formData);

  return (
    <div className="space-y-6">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
      />
      
      {showPaymentFields && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          projectPrice={projectPrice}
        />
      )}
    </div>
  );
};