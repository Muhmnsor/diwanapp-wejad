import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CreditCard, Calendar, Lock } from "lucide-react";
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
    if (!/^\d{16}$/.test(value)) {
      setErrors(prev => ({ ...prev, cardNumber: "الرجاء إدخال رقم بطاقة صحيح (16 رقم)" }));
      return false;
    }
    setErrors(prev => ({ ...prev, cardNumber: "" }));
    return true;
  };

  const validateExpiryDate = (value: string) => {
    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value)) {
      setErrors(prev => ({ ...prev, expiryDate: "الصيغة الصحيحة: MM/YY" }));
      return false;
    }

    const [month, year] = value.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();

    if (expiry < now) {
      setErrors(prev => ({ ...prev, expiryDate: "البطاقة منتهية الصلاحية" }));
      return false;
    }

    setErrors(prev => ({ ...prev, expiryDate: "" }));
    return true;
  };

  const validateCVV = (value: string) => {
    if (!/^\d{3,4}$/.test(value)) {
      setErrors(prev => ({ ...prev, cvv: "الرجاء إدخال رمز CVV صحيح (3-4 أرقام)" }));
      return false;
    }
    setErrors(prev => ({ ...prev, cvv: "" }));
    return true;
  };

  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-lg mb-4 text-right">معلومات الدفع</h3>
      
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-right block">رقم البطاقة</Label>
        <div className="relative">
          <CreditCard className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
          <Input
            id="cardNumber"
            value={formData.cardNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 16);
              setFormData({ ...formData, cardNumber: value });
              validateCardNumber(value);
            }}
            className={`text-right pr-10 ${errors.cardNumber ? 'border-red-500' : ''}`}
            placeholder="XXXX XXXX XXXX XXXX"
            required
            dir="ltr"
          />
        </div>
        {errors.cardNumber && (
          <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate" className="text-right block">تاريخ الانتهاء</Label>
          <div className="relative">
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="expiryDate"
              value={formData.expiryDate}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                  value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                setFormData({ ...formData, expiryDate: value });
                if (value.length === 5) validateExpiryDate(value);
              }}
              className={`text-right pr-10 ${errors.expiryDate ? 'border-red-500' : ''}`}
              placeholder="MM/YY"
              required
              dir="ltr"
            />
          </div>
          {errors.expiryDate && (
            <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.expiryDate}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cvv" className="text-right block">CVV</Label>
          <div className="relative">
            <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="cvv"
              value={formData.cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setFormData({ ...formData, cvv: value });
                validateCVV(value);
              }}
              className={`text-right pr-10 ${errors.cvv ? 'border-red-500' : ''}`}
              placeholder="XXX"
              required
              dir="ltr"
            />
          </div>
          {errors.cvv && (
            <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.cvv}
            </p>
          )}
        </div>
      </div>

      {eventPrice !== null && eventPrice !== "free" && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <AlertDescription className="text-right">
            <div className="font-semibold mb-1">تفاصيل الدفع</div>
            <div>رسوم التسجيل: {eventPrice} ريال</div>
            <div className="text-sm text-green-600 mt-1">
              سيتم معالجة الدفع مباشرة عند تأكيد التسجيل
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};