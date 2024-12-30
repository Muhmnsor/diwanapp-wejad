import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";
import { useState } from "react";

interface PersonalInfoFieldsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  setFormData: (data: any) => void;
}

export const PersonalInfoFields = ({
  formData,
  setFormData
}: PersonalInfoFieldsProps) => {
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const validateName = (value: string) => {
    if (!/^[\u0600-\u06FFa-zA-Z\s]{3,50}$/.test(value)) {
      setErrors(prev => ({ ...prev, name: "الرجاء إدخال اسم صحيح (3-50 حرف)" }));
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
    if (!/^05\d{8}$/.test(value)) {
      setErrors(prev => ({ ...prev, phone: "الرجاء إدخال رقم جوال صحيح يبدأ ب 05" }));
      return false;
    }
    setErrors(prev => ({ ...prev, phone: "" }));
    return true;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-right block mb-2">الاسم</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            validateName(e.target.value);
          }}
          className={`text-right ${errors.name ? 'border-red-500' : ''}`}
          placeholder="أدخل اسمك الكامل"
          required
          dir="rtl"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className="text-right block mb-2">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            validateEmail(e.target.value);
          }}
          className={`text-right ${errors.email ? 'border-red-500' : ''}`}
          placeholder="example@domain.com"
          required
          dir="ltr"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="text-right block mb-2">رقم الجوال</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, phone: value });
            validatePhone(value);
          }}
          className={`text-right ${errors.phone ? 'border-red-500' : ''}`}
          placeholder="05xxxxxxxx"
          required
          dir="ltr"
        />
        {errors.phone && (
          <p className="text-sm text-red-500 mt-1 text-right flex items-center justify-end gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.phone}
          </p>
        )}
      </div>

      <Alert className="bg-blue-50 text-blue-800 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-right">
          سيتم استخدام هذه المعلومات للتواصل معك بخصوص الفعالية
        </AlertDescription>
      </Alert>
    </div>
  );
};