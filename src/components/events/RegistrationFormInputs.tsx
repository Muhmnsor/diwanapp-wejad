import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface RegistrationFormInputsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
  };
  setFormData: (data: any) => void;
  eventPrice: number | "free" | null;
  showPaymentFields?: boolean;
}

export const RegistrationFormInputs = ({
  formData,
  setFormData,
  eventPrice,
  showPaymentFields = false
}: RegistrationFormInputsProps) => {
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const validateName = (value: string) => {
    if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(value)) {
      setErrors(prev => ({ ...prev, name: "الرجاء إدخال حروف فقط" }));
      return false;
    }
    setErrors(prev => ({ ...prev, name: "" }));
    return true;
  };

  const validateEmail = (value: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors(prev => ({ ...prev, email: "الرجاء إدخال بريد إلكتروني صحيح" }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  const validatePhone = (value: string) => {
    if (value && !/^05\d{8}$/.test(value)) {
      setErrors(prev => ({ ...prev, phone: "الرجاء إدخال رقم جوال صحيح يبدأ ب 05" }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    validateName(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    validateEmail(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d{0,10}$/.test(value)) {
      setFormData({ ...formData, phone: value });
      validatePhone(value);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setFormData({ ...formData, cardNumber: value });
    validateCardNumber(value);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setFormData({ ...formData, expiryDate: value });
    validateExpiryDate(value);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData({ ...formData, cvv: value });
    validateCVV(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-right block">الاسم</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleNameChange}
          className="text-right"
          dir="rtl"
          placeholder="أدخل اسمك الكامل (حروف فقط)"
          required
        />
        {errors.name && <p className="text-sm text-red-500 text-right">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          className="text-right"
          dir="rtl"
          placeholder="أدخل بريدك الإلكتروني"
          required
        />
        {errors.email && <p className="text-sm text-red-500 text-right">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-right block">رقم الجوال</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          className="text-right"
          dir="rtl"
          placeholder="أدخل رقم جوالك (يبدأ ب 05)"
          required
        />
        {errors.phone && <p className="text-sm text-red-500 text-right">{errors.phone}</p>}
      </div>
      
      {showPaymentFields && (
        <div className="space-y-4 mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-4 text-right">معلومات الدفع</h3>
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-right block">رقم البطاقة</Label>
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              className="text-right"
              dir="rtl"
              placeholder="أدخل رقم البطاقة"
              required={showPaymentFields}
            />
            {errors.cardNumber && <p className="text-sm text-red-500 text-right">{errors.cardNumber}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-right block">تاريخ الانتهاء</Label>
              <Input
                id="expiryDate"
                value={formData.expiryDate}
                onChange={handleExpiryDateChange}
                className="text-right"
                dir="rtl"
                placeholder="MM/YY"
                required={showPaymentFields}
              />
              {errors.expiryDate && <p className="text-sm text-red-500 text-right">{errors.expiryDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv" className="text-right block">CVV</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={handleCVVChange}
                className="text-right"
                dir="rtl"
                placeholder="CVV"
                required={showPaymentFields}
              />
              {errors.cvv && <p className="text-sm text-red-500 text-right">{errors.cvv}</p>}
            </div>
          </div>
        </div>
      )}
      
      {showPaymentFields && eventPrice !== null && eventPrice !== "free" && (
        <div className="bg-muted p-4 rounded-lg">
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