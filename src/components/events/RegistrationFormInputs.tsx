import { PersonalInfoFields } from "./form/PersonalInfoFields";
import { PaymentFields } from "./form/PaymentFields";

interface RegistrationFormInputsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    arabicName: string;
    englishName?: string;
    educationLevel?: string;
    birthDate?: string;
    nationalId?: string;
    gender?: string;
    workStatus?: string;
  };
  setFormData: (data: any) => void;
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
  console.log('🔄 RegistrationFormInputs - Registration Fields:', registrationFields);
  console.log('📝 RegistrationFormInputs - Form Data:', formData);

  return (
    <div className="space-y-4">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
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