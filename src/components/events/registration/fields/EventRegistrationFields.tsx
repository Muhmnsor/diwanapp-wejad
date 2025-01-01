import { PersonalInfoFields } from "./PersonalInfoFields";
import { PaymentFields } from "./PaymentFields";
import { RegistrationFormData } from "../types/registration";

interface EventRegistrationFieldsProps {
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
  eventPrice: number | "free" | null;
  showPaymentFields: boolean;
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
}

export const EventRegistrationFields = ({
  registrationFields,
  eventPrice,
  showPaymentFields,
  formData,
  setFormData
}: EventRegistrationFieldsProps) => {
  console.log('🔄 EventRegistrationFields - Current fields config:', registrationFields);
  console.log('📝 EventRegistrationFields - Current form data:', formData);

  if (!registrationFields) {
    console.error('❌ Registration fields are undefined');
    return null;
  }

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