import { PersonalInfoFields } from "./fields/PersonalInfoFields";
import { EducationFields } from "./fields/EducationFields";
import { IdentityFields } from "./fields/IdentityFields";
import { PaymentFields } from "../../form/PaymentFields";
import { RegistrationFormData } from "../types/registration";

interface EventRegistrationFieldsProps {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  projectPrice: number | "free" | null;
  registrationFields: {
    arabic_name: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    email: boolean;
    phone: boolean;
    gender: boolean;
    work_status: boolean;
  };
}

export const EventRegistrationFields = ({
  formData,
  setFormData,
  projectPrice,
  registrationFields,
}: EventRegistrationFieldsProps) => {
  console.log('Registration fields config:', registrationFields);
  console.log('Current form data:', formData);

  return (
    <div className="space-y-4">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
      />

      <EducationFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
      />

      <IdentityFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
      />

      {projectPrice !== "free" && projectPrice !== null && projectPrice > 0 && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={projectPrice}
        />
      )}
    </div>
  );
};