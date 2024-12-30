import { Input } from "@/components/ui/input";

interface PaymentFieldsProps {
  formData: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
  setFormData: (data: any) => void;
  eventPrice: number | "free" | null;
}

export const PaymentFields = ({ formData, setFormData, eventPrice }: PaymentFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium mb-4">
        المبلغ المطلوب: {typeof eventPrice === 'number' ? `${eventPrice} ريال` : 'مجاناً'}
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-1.5">رقم البطاقة</label>
        <Input
          value={formData.cardNumber}
          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
          className="text-right"
          placeholder="**** **** **** ****"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5">تاريخ الانتهاء</label>
          <Input
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="text-right"
            placeholder="MM/YY"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">رمز التحقق</label>
          <Input
            value={formData.cvv}
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
            className="text-right"
            placeholder="***"
            required
          />
        </div>
      </div>
    </div>
  );
};