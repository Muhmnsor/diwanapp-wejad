import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface RegistrationFieldsSelectorProps {
  formData: {
    arabic_name?: boolean;
    english_name?: boolean;
    education_level?: boolean;
    birth_date?: boolean;
    national_id?: boolean;
    email?: boolean;
    phone?: boolean;
  };
  setFormData: (data: any) => void;
}

export const RegistrationFieldsSelector = ({
  formData,
  setFormData,
}: RegistrationFieldsSelectorProps) => {
  const handleFieldChange = (field: string, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: checked,
    }));
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">حقول نموذج التسجيل</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="arabic_name"
            checked={formData.arabic_name}
            onCheckedChange={(checked) => handleFieldChange('arabic_name', checked as boolean)}
          />
          <Label htmlFor="arabic_name">الاسم الثلاثي بالعربية</Label>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="english_name"
            checked={formData.english_name}
            onCheckedChange={(checked) => handleFieldChange('english_name', checked as boolean)}
          />
          <Label htmlFor="english_name">الاسم الثلاثي بالإنجليزية</Label>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="education_level"
            checked={formData.education_level}
            onCheckedChange={(checked) => handleFieldChange('education_level', checked as boolean)}
          />
          <Label htmlFor="education_level">المرحلة الدراسية</Label>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="birth_date"
            checked={formData.birth_date}
            onCheckedChange={(checked) => handleFieldChange('birth_date', checked as boolean)}
          />
          <Label htmlFor="birth_date">تاريخ الميلاد</Label>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="national_id"
            checked={formData.national_id}
            onCheckedChange={(checked) => handleFieldChange('national_id', checked as boolean)}
          />
          <Label htmlFor="national_id">رقم الهوية</Label>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="email"
            checked={formData.email}
            onCheckedChange={(checked) => handleFieldChange('email', checked as boolean)}
          />
          <Label htmlFor="email">البريد الإلكتروني</Label>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <Checkbox
            id="phone"
            checked={formData.phone}
            onCheckedChange={(checked) => handleFieldChange('phone', checked as boolean)}
          />
          <Label htmlFor="phone">رقم الجوال</Label>
        </div>
      </div>
    </Card>
  );
};