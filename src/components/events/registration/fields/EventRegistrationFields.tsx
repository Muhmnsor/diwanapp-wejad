import { PersonalInfoFields } from "./PersonalInfoFields";
import { PaymentFields } from "./PaymentFields";

interface EventRegistrationFieldsProps {
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
  eventPrice: number | "free" | null;
  showPaymentFields: boolean;
  formData: any;
  setFormData: (data: any) => void;
}

export const EventRegistrationFields = ({
  registrationFields,
  eventPrice,
  showPaymentFields,
  formData,
  setFormData
}: EventRegistrationFieldsProps) => {
  console.log('Event registration fields:', registrationFields);

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