import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  eventPrice: number | "free" | null;
}

export const PaymentFields = ({ formData, setFormData, eventPrice }: PaymentFieldsProps) => {
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">رقم البطاقة</Label>
        <Input
          id="cardNumber"
          value={formData.cardNumber || ""}
          onChange={(e) => handleChange("cardNumber", e.target.value)}
          placeholder="أدخل رقم البطاقة"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
          <Input
            id="expiryDate"
            value={formData.expiryDate || ""}
            onChange={(e) => handleChange("expiryDate", e.target.value)}
            placeholder="MM/YY"
            required
          />
        </div>

        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={formData.cvv || ""}
            onChange={(e) => handleChange("cvv", e.target.value)}
            placeholder="123"
            required
          />
        </div>
      </div>
    </div>
  );
};