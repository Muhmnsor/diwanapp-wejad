import { RequiredRegistrationFields } from "./fields/RequiredRegistrationFields";
import { OptionalRegistrationFields } from "./fields/OptionalRegistrationFields";

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
  console.log('Registration fields in PersonalInfoFields:', registrationFields);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4 text-right" dir="rtl">
      <RequiredRegistrationFields
        formData={formData}
        handleInputChange={handleInputChange}
        registrationFields={registrationFields}
      />
      <OptionalRegistrationFields
        formData={formData}
        handleInputChange={handleInputChange}
        registrationFields={registrationFields}
      />
    </div>
  );
};