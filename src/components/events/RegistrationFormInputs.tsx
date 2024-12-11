import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface RegistrationFormInputsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  setFormData: (data: any) => void;
  eventPrice: number | "free";
}

export const RegistrationFormInputs = ({
  formData,
  setFormData,
  eventPrice,
}: RegistrationFormInputsProps) => {
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
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
    // Allow typing but show error if format is incorrect
    if (value && !/^05\d{8}$/.test(value)) {
      setErrors(prev => ({ ...prev, phone: "الرجاء إدخال رقم جوال صحيح يبدأ ب 05" }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: "" }));
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
    // Allow only numbers and limit to 10 digits
    if (value === '' || /^\d{0,10}$/.test(value)) {
      setFormData({ ...formData, phone: value });
      validatePhone(value);
    }
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
      
      {eventPrice !== "free" && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-center mb-2">رسوم التسجيل: {eventPrice} ريال</p>
          <p className="text-sm text-muted-foreground text-center">
            سيتم تحويلك إلى صفحة الدفع بعد تأكيد التسجيل
          </p>
        </div>
      )}
    </div>
  );
};