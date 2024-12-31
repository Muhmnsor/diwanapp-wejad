import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OptionalFieldsProps {
  formData: any;
  handleInputChange: (field: string, value: string) => void;
  registrationFields: {
    english_name: boolean;
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
}: OptionalFieldsProps) => {
  return (
    <>
      {registrationFields.english_name && (
        <div className="space-y-2">
          <Label>الاسم الثلاثي بالإنجليزية</Label>
          <Input
            value={formData.englishName}
            onChange={(e) => handleInputChange('englishName', e.target.value)}
            placeholder="Enter full name in English"
          />
        </div>
      )}

      {registrationFields.education_level && (
        <div className="space-y-2">
          <Label>المستوى التعليمي</Label>
          <Select
            value={formData.educationLevel}
            onValueChange={(value) => handleInputChange('educationLevel', value)}
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

      {registrationFields.birth_date && (
        <div className="space-y-2">
          <Label>تاريخ الميلاد</Label>
          <Input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
          />
        </div>
      )}

      {registrationFields.national_id && (
        <div className="space-y-2">
          <Label>رقم الهوية</Label>
          <Input
            value={formData.nationalId}
            onChange={(e) => handleInputChange('nationalId', e.target.value)}
            placeholder="أدخل رقم الهوية"
          />
        </div>
      )}

      {registrationFields.gender && (
        <div className="space-y-2">
          <Label>الجنس</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleInputChange('gender', value)}
          >
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

      {registrationFields.work_status && (
        <div className="space-y-2">
          <Label>الحالة الوظيفية</Label>
          <Select
            value={formData.workStatus}
            onValueChange={(value) => handleInputChange('workStatus', value)}
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