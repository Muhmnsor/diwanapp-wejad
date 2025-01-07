import { RegistrationFormData } from "../types/registration";
import { PersonalInfoFields } from "./fields/PersonalInfoFields";
import { PaymentFields } from "./fields/PaymentFields";

interface RegistrationFormFieldsProps {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData) => void;
  eventPrice: number | "free" | null;
  showPaymentFields: boolean;
}

export const RegistrationFormFields = ({
  formData,
  setFormData,
  eventPrice,
  showPaymentFields
}: RegistrationFormFieldsProps) => {
  return (
    <div className="space-y-6">
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