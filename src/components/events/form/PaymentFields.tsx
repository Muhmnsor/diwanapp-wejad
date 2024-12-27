import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PaymentFieldsProps {
  formData: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
  setFormData: (data: any) => void;
  eventPrice: number | "free" | null;
}

export const PaymentFields = ({
  formData,
  setFormData,
  eventPrice
}: PaymentFieldsProps) => {
  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const validateCardNumber = (value: string) => {
    if (value && !/^\d{16}$/.test(value)) {
      setErrors(prev => ({ ...prev, cardNumber: "الرجاء إدخال رقم بطاقة صحيح (16 رقم)" }));
      return false;
    }
    setErrors(prev => ({ ...prev, cardNumber: "" }));
    return true;
  };

  const validateExpiryDate = (value: string) => {
    if (value && !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) {
      setErrors(prev => ({ ...prev, expiryDate: "الرجاء إدخال تاريخ صلاحية صحيح (MM/YY)" }));
      return false;
    }
    setErrors(prev => ({ ...prev, expiryDate: "" }));
    return true;
  };

  const validateCVV = (value: string) => {
    if (value && !/^\d{3,4}$/.test(value)) {
      setErrors(prev => ({ ...prev, cvv: "الرجاء إدخال رمز CVV صحيح (3-4 أرقام)" }));
      return false;
    }
    setErrors(prev => ({ ...prev, cvv: "" }));
    return true;
  };

  return (
    <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold text-lg mb-4 text-right">معلومات الدفع</h3>
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-right block">رقم البطاقة</Label>
        <Input
          id="cardNumber"
          value={formData.cardNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
            setFormData({ ...formData, cardNumber: value });
            validateCardNumber(value);
          }}
          className="text-right"
          dir="rtl"
          placeholder="أدخل رقم البطاقة"
          required
        />
        {errors.cardNumber && <p className="text-sm text-red-500 text-right">{errors.cardNumber}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate" className="text-right block">تاريخ الانتهاء</Label>
          <Input
            id="expiryDate"
            value={formData.expiryDate}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
              }
              setFormData({ ...formData, expiryDate: value });
              validateExpiryDate(value);
            }}
            className="text-right"
            dir="rtl"
            placeholder="MM/YY"
            required
          />
          {errors.expiryDate && <p className="text-sm text-red-500 text-right">{errors.expiryDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv" className="text-right block">CVV</Label>
          <Input
            id="cvv"
            value={formData.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 4);
              setFormData({ ...formData, cvv: value });
              validateCVV(value);
            }}
            className="text-right"
            dir="rtl"
            placeholder="CVV"
            required
          />
          {errors.cvv && <p className="text-sm text-red-500 text-right">{errors.cvv}</p>}
        </div>
      </div>
      {eventPrice !== null && eventPrice !== "free" && (
        <div className="bg-muted p-4 rounded-lg mt-4">
          <p className="text-center mb-2 font-semibold">تفاصيل الدفع</p>
          <p className="text-center mb-2">رسوم التسجيل: {eventPrice} ريال</p>
          <p className="text-sm text-muted-foreground text-center">
            سيتم معالجة الدفع مباشرة عند تأكيد التسجيل
          </p>
        </div>
      )}
    </div>
  );
};