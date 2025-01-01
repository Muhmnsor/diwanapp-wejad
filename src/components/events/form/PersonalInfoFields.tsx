import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PersonalInfoFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  registrationFields: {
    arabic_name: boolean;
    email: boolean;
    phone: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
}

export const PersonalInfoFields = ({
  formData,
  setFormData,
  registrationFields
}: PersonalInfoFieldsProps) => {
  console.log('🔍 PersonalInfoFields - Registration fields:', registrationFields);
  console.log('📋 PersonalInfoFields - Form data:', formData);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // التحقق من صحة الاسم العربي
  const validateArabicName = (value: string) => {
    const arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (!arabicRegex.test(value)) {
      setErrors(prev => ({ ...prev, arabicName: "يرجى إدخال الاسم باللغة العربية فقط" }));
      return false;
    }
    setErrors(prev => ({ ...prev, arabicName: "" }));
    return true;
  };

  // التحقق من صحة البريد الإلكتروني
  const validateEmail = (value: string) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: "يرجى إدخال بريد إلكتروني صحيح" }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  // التحقق من صحة رقم الهاتف
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
    console.log(`🔄 Field change - ${field}:`, value);
    let isValid = true;

    if (field === 'arabicName') {
      isValid = validateArabicName(value);
    } else if (field === 'email') {
      isValid = validateEmail(value);
    } else if (field === 'phone') {
      isValid = validatePhone(value);
    }

    if (isValid) {
      setFormData({ ...formData, [field]: value });
    }
  };

  return (
    <>
      {registrationFields.arabic_name && (
        <div className="space-y-2">
          <Label>الاسم الثلاثي بالعربية</Label>
          <Input
            value={formData.arabicName || ""}
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
            value={formData.email || ""}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="أدخل البريد الإلكتروني"
            className={errors.email ? "border-red-500" : ""}
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
      )}

      {registrationFields.phone && (
        <div className="space-y-2">
          <Label>رقم الجوال</Label>
          <Input
            type="tel"
            value={formData.phone || ""}
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