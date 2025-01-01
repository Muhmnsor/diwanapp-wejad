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
}

export const EventRegistrationFields = ({
  registrationFields,
  eventPrice,
  showPaymentFields
}: EventRegistrationFieldsProps) => {
  console.log('Event registration fields:', registrationFields);

  return (
    <div className="space-y-4">
      <PersonalInfoFields
        registrationFields={registrationFields}
      />
      {showPaymentFields && (
        <PaymentFields
          price={eventPrice}
        />
      )}
    </div>
  );
};