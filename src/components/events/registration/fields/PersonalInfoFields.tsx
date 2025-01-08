import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {registrationFields.arabic_name && (
        <div>
          <Label htmlFor="arabicName">الاسم الثلاثي بالعربية</Label>
          <Input
            id="arabicName"
            value={formData.arabicName || ""}
            onChange={(e) => handleChange("arabicName", e.target.value)}
            placeholder="أدخل الاسم الثلاثي بالعربية"
            required
          />
        </div>
      )}

      {registrationFields.english_name && (
        <div>
          <Label htmlFor="englishName">الاسم الثلاثي بالإنجليزية</Label>
          <Input
            id="englishName"
            value={formData.englishName || ""}
            onChange={(e) => handleChange("englishName", e.target.value)}
            placeholder="أدخل الاسم الثلاثي بالإنجليزية"
          />
        </div>
      )}

      {registrationFields.email && (
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="أدخل البريد الإلكتروني"
            required
          />
        </div>
      )}

      {registrationFields.phone && (
        <div>
          <Label htmlFor="phone">رقم الجوال</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="05xxxxxxxx"
            required
          />
        </div>
      )}
    </div>
  );
};