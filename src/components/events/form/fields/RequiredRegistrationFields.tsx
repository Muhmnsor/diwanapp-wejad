import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface RequiredFieldsProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  registrationFields: {
    arabic_name: boolean;
    email: boolean;
    phone: boolean;
  };
}

export const RequiredRegistrationFields = ({
  formData,
  handleInputChange,
  registrationFields
}: RequiredFieldsProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateArabicName = (value: string) => {
    const arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (!arabicRegex.test(value)) {
      setErrors(prev => ({ ...prev, arabicName: "يرجى إدخال الاسم باللغة العربية فقط" }));
      return false;
    }
    setErrors(prev => ({ ...prev, arabicName: "" }));
    return true;
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(value)) {
      setErrors(prev => ({ ...prev, phone: "يجب أن يبدأ رقم الجوال ب 05 ويتكون من 10 أرقام" }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

  const handleChange = (field: string, value: string) => {
    let isValid = true;

    if (field === 'arabicName') {
      isValid = validateArabicName(value);
    } else if (field === 'phone') {
      isValid = validatePhone(value);
    }

    if (isValid) {
      handleInputChange(field, value);
    }
  };

  return (
    <>
      {registrationFields.arabic_name && (
        <div className="space-y-2">
          <Label>الاسم الثلاثي بالعربية</Label>
          <Input
            value={formData.arabicName}
            onChange={(e) => handleChange('arabicName', e.target.value)}
            placeholder="أدخل الاسم الثلاثي بالعربية"
            className={errors.arabicName ? "border-red-500" : ""}
            required
          />
          {errors.arabicName && (
            <p className="text-sm text-red-500">{errors.arabicName}</p>
          )}
        </div>
      )}

      {registrationFields.email && (
        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="أدخل البريد الإلكتروني"
            required
          />
        </div>
      )}

      {registrationFields.phone && (
        <div className="space-y-2">
          <Label>رقم الجوال</Label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="أدخل رقم الجوال"
            className={errors.phone ? "border-red-500" : ""}
            required
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      )}
    </>
  );
};