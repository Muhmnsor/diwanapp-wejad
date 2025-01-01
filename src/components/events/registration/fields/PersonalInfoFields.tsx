import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalInfoFieldsProps {
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
  registrationFields
}: PersonalInfoFieldsProps) => {
  console.log('Registration fields in PersonalInfoFields:', registrationFields);

  return (
    <div className="space-y-4">
      {registrationFields.arabic_name && (
        <div>
          <Label htmlFor="arabicName">الاسم الثلاثي بالعربية</Label>
          <Input
            id="arabicName"
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
            placeholder="أدخل رقم الجوال"
            required
          />
        </div>
      )}

      {registrationFields.national_id && (
        <div>
          <Label htmlFor="nationalId">رقم الهوية</Label>
          <Input
            id="nationalId"
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
          />
        </div>
      )}

      {registrationFields.gender && (
        <div>
          <Label htmlFor="gender">الجنس</Label>
          <Select>
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
          <Select>
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
          <Select>
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
    </div>
  );
};