import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFieldsProps {
  price: number | "free" | null;
}

export const PaymentFields = ({ price }: PaymentFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">رقم البطاقة</Label>
        <Input
          id="cardNumber"
          placeholder="أدخل رقم البطاقة"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            required
          />
        </div>

        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            placeholder="123"
            required
          />
        </div>
      </div>
    </div>
  );
};