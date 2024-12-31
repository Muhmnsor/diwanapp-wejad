import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  return (
    <>
      {registrationFields.arabic_name && (
        <div className="space-y-2">
          <Label>الاسم الثلاثي بالعربية</Label>
          <Input
            value={formData.arabicName}
            onChange={(e) => handleInputChange('arabicName', e.target.value)}
            placeholder="أدخل الاسم الثلاثي بالعربية"
            required
          />
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
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="أدخل رقم الجوال"
            required
          />
        </div>
      )}
    </>
  );
};