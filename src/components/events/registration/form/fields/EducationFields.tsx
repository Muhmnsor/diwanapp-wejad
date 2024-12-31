import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegistrationFormData } from "../../types/registration";

interface EducationFieldsProps {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
  registrationFields: {
    education_level: boolean;
    work_status: boolean;
  };
}

export const EducationFields = ({
  formData,
  setFormData,
  registrationFields,
}: EducationFieldsProps) => {
  return (
    <>
      {registrationFields.education_level && (
        <div>
          <Label htmlFor="educationLevel">المستوى التعليمي</Label>
          <Select
            value={formData.educationLevel}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, educationLevel: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستوى التعليمي" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">ابتدائي</SelectItem>
              <SelectItem value="intermediate">متوسط</SelectItem>
              <SelectItem value="high_school">ثانوي</SelectItem>
              <SelectItem value="bachelor">بكالوريوس</SelectItem>
              <SelectItem value="master">ماجستير</SelectItem>
              <SelectItem value="phd">دكتوراه</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {registrationFields.work_status && (
        <div>
          <Label htmlFor="workStatus">الحالة الوظيفية</Label>
          <Select
            value={formData.workStatus}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, workStatus: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الحالة الوظيفية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employed">موظف</SelectItem>
              <SelectItem value="unemployed">غير موظف</SelectItem>
              <SelectItem value="student">طالب</SelectItem>
              <SelectItem value="retired">متقاعد</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};