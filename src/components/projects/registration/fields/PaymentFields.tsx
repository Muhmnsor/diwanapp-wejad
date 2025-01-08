import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectRegistrationFormData } from "../types/registration";

interface PaymentFieldsProps {
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  projectPrice: number | "free" | null;
}

export const PaymentFields = ({
  formData,
  setFormData,
  projectPrice
}: PaymentFieldsProps) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const handleChange = (field: keyof typeof paymentData, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <h3 className="font-medium text-lg mb-4">معلومات الدفع ({projectPrice} ريال)</h3>
      
      <div>
        <Label htmlFor="cardNumber">رقم البطاقة</Label>
        <Input
          id="cardNumber"
          value={paymentData.cardNumber}
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
            value={paymentData.expiryDate}
            onChange={(e) => handleChange("expiryDate", e.target.value)}
            placeholder="MM/YY"
            required
          />
        </div>

        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={paymentData.cvv}
            onChange={(e) => handleChange("cvv", e.target.value)}
            placeholder="123"
            required
          />
        </div>
      </div>
    </div>
  );
};