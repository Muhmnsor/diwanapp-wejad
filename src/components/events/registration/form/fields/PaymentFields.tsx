import { FormField } from "@/components/events/form/fields/FormField";
import { TextInputField } from "@/components/events/form/fields/TextInputField";
import { RegistrationFormData } from "../../types/registration";

interface PaymentFieldsProps {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData) => void;
  eventPrice: number | "free" | null;
}

export const PaymentFields = ({ formData, setFormData, eventPrice }: PaymentFieldsProps) => {
  if (eventPrice === "free" || !eventPrice || typeof eventPrice !== "number") {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">معلومات الدفع</h3>
      <FormField label="رقم البطاقة" required>
        <TextInputField
          value={formData.cardNumber}
          onChange={(value) => setFormData({ ...formData, cardNumber: value })}
          required
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="تاريخ الانتهاء" required>
          <TextInputField
            value={formData.expiryDate}
            onChange={(value) => setFormData({ ...formData, expiryDate: value })}
            placeholder="MM/YY"
            required
          />
        </FormField>
        <FormField label="CVV" required>
          <TextInputField
            value={formData.cvv}
            onChange={(value) => setFormData({ ...formData, cvv: value })}
            required
          />
        </FormField>
      </div>
    </div>
  );
};