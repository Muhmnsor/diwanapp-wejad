import { FormField } from "@/components/events/form/fields/FormField";
import { TextInputField } from "@/components/events/form/fields/TextInputField";
import { SelectField } from "@/components/events/form/fields/SelectField";
import { RegistrationFormData } from "../../types/registration";

interface OptionalFieldsProps {
  formData: RegistrationFormData;
  setFormData: (data: RegistrationFormData) => void;
  registrationFields: {
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
}

export const OptionalFields = ({
  formData,
  setFormData,
  registrationFields,
}: OptionalFieldsProps) => {
  return (
    <div className="space-y-4">
      {registrationFields.english_name && (
        <FormField label="الاسم الثلاثي بالإنجليزية">
          <TextInputField
            value={formData.englishName}
            onChange={(value) => setFormData({ ...formData, englishName: value })}
          />
        </FormField>
      )}

      {registrationFields.education_level && (
        <FormField label="المستوى التعليمي">
          <SelectField
            value={formData.educationLevel}
            onChange={(value) => setFormData({ ...formData, educationLevel: value })}
            options={[
              { value: "primary", label: "ابتدائي" },
              { value: "intermediate", label: "متوسط" },
              { value: "high_school", label: "ثانوي" },
              { value: "bachelor", label: "بكالوريوس" },
              { value: "master", label: "ماجستير" },
              { value: "phd", label: "دكتوراه" }
            ]}
          />
        </FormField>
      )}

      {registrationFields.birth_date && (
        <FormField label="تاريخ الميلاد">
          <TextInputField
            type="date"
            value={formData.birthDate}
            onChange={(value) => setFormData({ ...formData, birthDate: value })}
          />
        </FormField>
      )}

      {registrationFields.national_id && (
        <FormField label="رقم الهوية">
          <TextInputField
            value={formData.nationalId}
            onChange={(value) => setFormData({ ...formData, nationalId: value })}
          />
        </FormField>
      )}

      {registrationFields.gender && (
        <FormField label="الجنس">
          <SelectField
            value={formData.gender}
            onChange={(value) => setFormData({ ...formData, gender: value })}
            options={[
              { value: "male", label: "ذكر" },
              { value: "female", label: "أنثى" }
            ]}
          />
        </FormField>
      )}

      {registrationFields.work_status && (
        <FormField label="الحالة الوظيفية">
          <SelectField
            value={formData.workStatus}
            onChange={(value) => setFormData({ ...formData, workStatus: value })}
            options={[
              { value: "employed", label: "موظف" },
              { value: "unemployed", label: "غير موظف" },
              { value: "student", label: "طالب" },
              { value: "retired", label: "متقاعد" }
            ]}
          />
        </FormField>
      )}
    </div>
  );
};