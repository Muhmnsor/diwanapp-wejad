import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface OptionalRegistrationFieldsProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  registrationFields: {
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
}

export const OptionalRegistrationFields = ({
  formData,
  handleInputChange,
  registrationFields
}: OptionalRegistrationFieldsProps) => {
  console.log('🔄 OptionalRegistrationFields - Registration Fields:', registrationFields);
  console.log('📝 OptionalRegistrationFields - Form Data:', formData);

  return (
    <>
      {registrationFields.national_id && (
        <div>
          <Label htmlFor="nationalId">رقم الهوية</Label>
          <Input
            id="nationalId"
            value={formData.nationalId || ""}
            onChange={(e) => handleInputChange("nationalId", e.target.value)}
            placeholder="أدخل رقم الهوية"
          />
        </div>
      )}

      {registrationFields.birth_date && (
        <div>
          <Label htmlFor="birthDate">تاريخ الميلاد</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate || ""}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
          />
        </div>
      )}

      {registrationFields.gender && (
        <div>
          <Label htmlFor="gender">الجنس</Label>
          <Select value={formData.gender || ""} onValueChange={(value) => handleInputChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الجنس" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {registrationFields.education_level && (
        <div>
          <Label htmlFor="educationLevel">المستوى التعليمي</Label>
          <Select 
            value={formData.educationLevel || ""} 
            onValueChange={(value) => handleInputChange("educationLevel", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستوى التعليمي" />
            </SelectTrigger>
            <SelectContent>
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
            value={formData.workStatus || ""} 
            onValueChange={(value) => handleInputChange("workStatus", value)}
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