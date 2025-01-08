import { useState } from "react";
import { RegistrationFormData } from "../registration/types/registration";
import { ArabicNameField } from "./fields/ArabicNameField";
import { EnglishNameField } from "./fields/EnglishNameField";
import { EmailField } from "./fields/EmailField";
import { PhoneField } from "./fields/PhoneField";

interface PersonalInfoFieldsProps {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData) => void;
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

  const validateArabicName = (value: string) => {
    const arabicRegex = /^[\u0600-\u06FF\s]*$/;
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, arabicName: "الاسم مطلوب" }));
      return false;
    }
    if (!arabicRegex.test(value)) {
      setErrors(prev => ({ ...prev, arabicName: "يرجى إدخال الاسم باللغة العربية فقط" }));
      return false;
    }
    setErrors(prev => ({ ...prev, arabicName: "" }));
    return true;
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: "البريد الإلكتروني مطلوب" }));
      return false;
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(value)) {
      setErrors(prev => ({ ...prev, email: "يرجى إدخال بريد إلكتروني صحيح" }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, phone: "رقم الجوال مطلوب" }));
      return false;
    }
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(value)) {
      setErrors(prev => ({ ...prev, phone: "يجب أن يبدأ رقم الجوال ب 05 ويتكون من 10 أرقام" }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (field === 'arabicName') {
      validateArabicName(value);
    } else if (field === 'email') {
      validateEmail(value);
    } else if (field === 'phone') {
      validatePhone(value);
    }
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      {registrationFields.arabic_name && (
        <ArabicNameField
          value={formData.arabicName || ""}
          onChange={(value) => handleChange('arabicName', value)}
          error={errors.arabicName}
        />
      )}

      {registrationFields.english_name && (
        <EnglishNameField
          value={formData.englishName || ""}
          onChange={(value) => handleChange('englishName', value)}
          error={errors.englishName}
        />
      )}

      {registrationFields.email && (
        <EmailField
          value={formData.email || ""}
          onChange={(value) => handleChange('email', value)}
          error={errors.email}
        />
      )}

      {registrationFields.phone && (
        <PhoneField
          value={formData.phone || ""}
          onChange={(value) => handleChange('phone', value)}
          error={errors.phone}
        />
      )}
    </div>
  );
};