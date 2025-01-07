import { FormField } from "@/components/events/form/fields/FormField";
import { TextInputField } from "@/components/events/form/fields/TextInputField";
import { RegistrationFormData } from "../../types/registration";

interface PersonalInfoFieldsProps {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData) => void;
  registrationFields: {
    arabic_name: boolean;
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
    <div className="space-y-4">
      {registrationFields.arabic_name && (
        <FormField label="الاسم الثلاثي بالعربية" required>
          <TextInputField
            value={formData.arabicName}
            onChange={(value) => setFormData({ ...formData, arabicName: value })}
            required
          />
        </FormField>
      )}

      {registrationFields.email && (
        <FormField label="البريد الإلكتروني" required>
          <TextInputField
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            required
          />
        </FormField>
      )}

      {registrationFields.phone && (
        <FormField label="رقم الجوال" required>
          <TextInputField
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            required
          />
        </FormField>
      )}
    </div>
  );
};