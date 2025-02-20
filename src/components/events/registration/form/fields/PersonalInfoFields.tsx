
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
    // إذا كان الحقل فارغاً، لا نظهر أي خطأ
    if (!value) {
      setErrors(prev => ({ ...prev, phone: "" }));
      return true;
    }

    // التحقق من أن القيمة تحتوي على أرقام فقط
    if (!/^\d+$/.test(value)) {
      setErrors(prev => ({ ...prev, phone: "يجب إدخال أرقام فقط" }));
      return false;
    }

    // التحقق من أن الرقم يبدأ بـ 05 إذا كان طوله أكبر من رقمين
    if (value.length >= 2 && !value.startsWith('05')) {
      setErrors(prev => ({ ...prev, phone: "يجب أن يبدأ رقم الجوال بـ 05" }));
      return false;
    }

    // التحقق من طول الرقم
    if (value.length > 10) {
      setErrors(prev => ({ ...prev, phone: "يجب ألا يتجاوز رقم الجوال 10 أرقام" }));
      return false;
    }

    // إذا وصل الرقم إلى 10 أرقام، نتحقق من صحة التنسيق الكامل
    if (value.length === 10) {
      const phoneRegex = /^05\d{8}$/;
      if (!phoneRegex.test(value)) {
        setErrors(prev => ({ ...prev, phone: "يجب أن يتكون رقم الجوال من 10 أرقام ويبدأ بـ 05" }));
        return false;
      }
    }

    // إزالة رسالة الخطأ إذا كان الإدخال صحيحاً حتى الآن
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

  const handleChange = (field: keyof RegistrationFormData, value: string) => {
    if (field === 'arabicName') {
      if (validateArabicName(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else if (field === 'phone') {
      // السماح فقط بالأرقام
      if (!/^\d*$/.test(value)) {
        return;
      }
      // التحقق من الرقم وتحديث القيمة إذا كان صحيحاً
      if (validatePhone(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
      } else {
        // تحديث القيمة حتى لو كان هناك خطأ لنتمكن من تتبع الإدخال
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      // للحقول الأخرى مثل البريد الإلكتروني
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
