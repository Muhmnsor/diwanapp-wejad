import { PersonalInfoFields } from "./form/PersonalInfoFields";
import { PaymentFields } from "./form/PaymentFields";
import { OptionalRegistrationFields } from "./form/fields/OptionalRegistrationFields";
import { RegistrationFormData } from "./registration/types/registration";

interface RegistrationFormInputsProps {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData) => void;
  eventPrice: number | "free" | null;
  showPaymentFields?: boolean;
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
}

export const RegistrationFormInputs = ({
  formData,
  setFormData,
  eventPrice,
  showPaymentFields = false,
  registrationFields
}: RegistrationFormInputsProps) => {
  console.log('📝 RegistrationFormInputs - Form Data:', formData);
  console.log('🔄 RegistrationFormInputs - Registration Fields:', registrationFields);

  return (
    <div className="space-y-4">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
      />
      
      <OptionalRegistrationFields
        formData={formData}
        handleInputChange={(field, value) => setFormData({ ...formData, [field]: value })}
        registrationFields={registrationFields}
      />
      
      {showPaymentFields && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={eventPrice}
        />
      )}
    </div>
  );
};