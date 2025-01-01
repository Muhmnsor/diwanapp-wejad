import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectRegistrationFormData, ProjectRegistrationFieldsConfig } from "../types/registration";

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

  if (!registrationFields) {
    console.log('No registration fields provided, using defaults');
    registrationFields = {
      arabic_name: true,
      email: true,
      phone: true,
      english_name: false,
      education_level: false,
      birth_date: false,
      national_id: false,
      gender: false,
      work_status: false
    };
  }

  const handleChange = (field: keyof ProjectRegistrationFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      {registrationFields.arabic_name && (
        <div>
          <Label htmlFor="arabicName">الاسم بالعربية</Label>
          <Input
            id="arabicName"
            value={formData.arabicName || ""}
            onChange={(e) => handleChange("arabicName", e.target.value)}
            placeholder="أدخل الاسم بالعربية"
            required
          />
        </div>
      )}

      {registrationFields.english_name && (
        <div>
          <Label htmlFor="englishName">الاسم بالإنجليزية</Label>
          <Input
            id="englishName"
            value={formData.englishName || ""}
            onChange={(e) => handleChange("englishName", e.target.value)}
            placeholder="Enter your name in English"
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
            placeholder="أدخل رقم الجوال"
            required
          />
        </div>
      )}

      {registrationFields.gender && (
        <div>
          <Label htmlFor="gender">الجنس</Label>
          <Select 
            value={formData.gender || ""} 
            onValueChange={(value) => handleChange("gender", value)}
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
        <div>
          <Label htmlFor="workStatus">الحالة الوظيفية</Label>
          <Select 
            value={formData.workStatus || ""} 
            onValueChange={(value) => handleChange("workStatus", value)}
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
    </div>
  );
};