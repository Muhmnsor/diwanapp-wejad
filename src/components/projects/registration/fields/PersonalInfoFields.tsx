import { ProjectRegistrationFormData, ProjectRegistrationFieldsConfig } from "../types/registration";
import { ArabicNameField } from "./components/ArabicNameField";
import { PhoneField } from "./components/PhoneField";
import { EmailField } from "./components/EmailField";
import { EnglishNameField } from "./components/EnglishNameField";
import { NationalIdField } from "./components/NationalIdField";
import { GenderField } from "./components/GenderField";
import { EducationLevelField } from "./components/EducationLevelField";
import { BirthDateField } from "./components/BirthDateField";
import { WorkStatusField } from "./components/WorkStatusField";

interface PersonalInfoFieldsProps {
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  registrationFields: ProjectRegistrationFieldsConfig;
}

export const PersonalInfoFields = ({
  formData,
  setFormData,
  registrationFields
}: PersonalInfoFieldsProps) => {
  console.log('PersonalInfoFields - Registration fields:', registrationFields);
  console.log('PersonalInfoFields - Form data:', formData);

  const handleChange = (field: keyof ProjectRegistrationFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {registrationFields.arabic_name && (
        <ArabicNameField
          value={formData.arabicName || ""}
          onChange={(value) => handleChange("arabicName", value)}
        />
      )}

      {registrationFields.phone && (
        <PhoneField
          value={formData.phone || ""}
          onChange={(value) => handleChange("phone", value)}
        />
      )}

      {registrationFields.email && (
        <EmailField
          value={formData.email || ""}
          onChange={(value) => handleChange("email", value)}
        />
      )}

      {registrationFields.english_name && (
        <EnglishNameField
          value={formData.englishName || ""}
          onChange={(value) => handleChange("englishName", value)}
        />
      )}

      {registrationFields.national_id && (
        <NationalIdField
          value={formData.nationalId || ""}
          onChange={(value) => handleChange("nationalId", value)}
        />
      )}

      {registrationFields.gender && (
        <GenderField
          value={formData.gender || ""}
          onChange={(value) => handleChange("gender", value)}
        />
      )}

      {registrationFields.education_level && (
        <EducationLevelField
          value={formData.educationLevel || ""}
          onChange={(value) => handleChange("educationLevel", value)}
        />
      )}

      {registrationFields.birth_date && (
        <BirthDateField
          value={formData.birthDate || ""}
          onChange={(value) => handleChange("birthDate", value)}
        />
      )}

      {registrationFields.work_status && (
        <WorkStatusField
          value={formData.workStatus || ""}
          onChange={(value) => handleChange("workStatus", value)}
        />
      )}
    </div>
  );
};