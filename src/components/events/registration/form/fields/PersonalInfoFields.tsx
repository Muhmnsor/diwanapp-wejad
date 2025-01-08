import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RegistrationFormData } from "../../types/registration";

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
  return (
    <>
      {registrationFields.arabic_name && (
        <div>
          <Label htmlFor="arabicName">الاسم الثلاثي بالعربية</Label>
          <Input
            id="arabicName"
            value={formData.arabicName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, arabicName: e.target.value }))
            }
            placeholder="أدخل اسمك بالعربي"
            required
          />
        </div>
      )}

      {registrationFields.email && (
        <div>
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder="أدخل رقم جوالك"
            required
          />
        </div>
      )}
    </>
  );
};