import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RegistrationFormData } from "../../hooks/useRegistrationState";

interface PaymentFieldsProps {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
}

export const PaymentFields = ({
  formData,
  setFormData,
}: PaymentFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="cardNumber">رقم البطاقة</Label>
        <Input
          id="cardNumber"
          value={formData.cardNumber}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              cardNumber: e.target.value,
            }))
          }
          placeholder="أدخل رقم البطاقة"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
          <Input
            id="expiryDate"
            value={formData.expiryDate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                expiryDate: e.target.value,
              }))
            }
            placeholder="MM/YY"
            required
          />
        </div>

        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={formData.cvv}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cvv: e.target.value }))
            }
            placeholder="123"
            required
          />
        </div>
      </div>
    </>
  );
};