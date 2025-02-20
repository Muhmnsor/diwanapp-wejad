
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RegistrationFormData } from "../../types/registration";
import { useState } from "react";

interface PersonalInfoFieldsProps {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  registrationFields: {
    arabic_name: boolean;
    english_name: boolean;
    email: boolean;
    phone: boolean;
  };
}

export const PersonalInfoFields = ({
  formData,
  setFormData,
  registrationFields,
}: PersonalInfoFieldsProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateArabicName = (value: string) => {
    const arabicRegex = /^[\u0600-\u06FF\s]*$/;
    if (!arabicRegex.test(value)) {
      setErrors(prev => ({ ...prev, arabicName: "يرجى إدخال الاسم باللغة العربية فقط" }));
      return false;
    }
    setErrors(prev => ({ ...prev, arabicName: "" }));
    return true;
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^05\d{8}$/;
    if (value && !phoneRegex.test(value)) {
      setErrors(prev => ({ ...prev, phone: "يجب أن يبدأ رقم الجوال ب 05 ويتكون من 10 أرقام" }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    let isValid = true;

    if (field === 'arabicName') {
      isValid = validateArabicName(value);
    } else if (field === 'phone') {
      // Only allow numbers and limit to 10 digits for phone
      if (!/^\d*$/.test(value) || value.length > 10) {
        return;
      }
      isValid = validatePhone(value);
    }

    if (isValid) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <>
      {registrationFields.arabic_name && (
        <div>
          <Label htmlFor="arabicName">الاسم الثلاثي بالعربية</Label>
          <Input
            id="arabicName"
            value={formData.arabicName}
            onChange={(e) => handleChange('arabicName', e.target.value)}
            placeholder="أدخل اسمك بالعربي"
            className={errors.arabicName ? "border-red-500" : ""}
            required
          />
          {errors.arabicName && <p className="text-sm text-red-500">{errors.arabicName}</p>}
        </div>
      )}

      {registrationFields.email && (
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="أدخل بريدك الإلكتروني"
            required
          />
        </div>
      )}

      {registrationFields.phone && (
        <div>
          <Label htmlFor="phone">رقم الجوال</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="05xxxxxxxx"
            className={errors.phone ? "border-red-500" : ""}
            required
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>
      )}
    </>
  );
};
