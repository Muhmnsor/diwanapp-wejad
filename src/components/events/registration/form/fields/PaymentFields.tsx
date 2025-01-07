import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegistrationFormData } from "../../types/registration";

interface PaymentFieldsProps {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData) => void;
  eventPrice: number | "free" | null;
}

export const PaymentFields = ({
  formData,
  setFormData,
  eventPrice
}: PaymentFieldsProps) => {
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-lg mb-4 text-right">معلومات الدفع</h3>
      
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-right block">رقم البطاقة</Label>
        <Input
          id="cardNumber"
          value={formData.cardNumber}
          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
          placeholder="XXXX XXXX XXXX XXXX"
          required
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate" className="text-right block">تاريخ الانتهاء</Label>
          <Input
            id="expiryDate"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            placeholder="MM/YY"
            required
            dir="ltr"
          />
        </div>

        <div>
          <Label htmlFor="cvv" className="text-right block">CVV</Label>
          <Input
            id="cvv"
            value={formData.cvv}
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
            placeholder="123"
            required
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
};