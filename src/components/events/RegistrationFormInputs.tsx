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
  };
  setFormData: (data: any) => void;
  eventPrice: number | "free" | null;
  showPaymentFields?: boolean;
}

export const RegistrationFormInputs = ({
  formData,
  setFormData,
  eventPrice,
  showPaymentFields = false
}: RegistrationFormInputsProps) => {
  return (
    <div className="space-y-4">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
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