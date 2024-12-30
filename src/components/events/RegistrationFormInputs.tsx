import { PersonalInfoFields } from "./form/PersonalInfoFields";
import { PaymentFields } from "./form/PaymentFields";

interface FormData {
  name: string;
  email: string;
  phone: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

interface RegistrationFormInputsProps {
  formData: FormData;
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
          formData={{
            cardNumber: formData.cardNumber || '',
            expiryDate: formData.expiryDate || '',
            cvv: formData.cvv || ''
          }}
          setFormData={setFormData}
          eventPrice={eventPrice}
        />
      )}
    </div>
  );
};