import { PersonalInfoFields } from "./fields/PersonalInfoFields";
import { PaymentFields } from "./fields/PaymentFields";
import { OptionalRegistrationFields } from "./fields/OptionalRegistrationFields";
import { RegistrationFormData } from "../types/registration";

interface RegistrationFormFieldsProps {
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

export const RegistrationFormFields = ({
  formData,
  setFormData,
  eventPrice,
  showPaymentFields = false,
  registrationFields
}: RegistrationFormFieldsProps) => {
  console.log('📝 RegistrationFormFields - Form Data:', formData);
  console.log('🔄 RegistrationFormFields - Registration Fields:', registrationFields);

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