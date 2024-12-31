import { Event } from "@/store/eventStore";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface RegistrationFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const RegistrationFields = ({ formData, setFormData }: RegistrationFieldsProps) => {
  const handleFieldChange = (field: string, value: boolean) => {
    setFormData({
      ...formData,
      registration_fields: {
        ...formData.registration_fields,
        [field]: value
      }
    });
  };

  // Initialize registration fields if they don't exist
  if (!formData.registration_fields) {
    formData.registration_fields = {
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

  return (
    <Card className="space-y-4">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-6">معلومات المستفيدين المطلوبة</h3>
        
        {/* Required Fields - Disabled switches */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">الاسم بالعربي</Label>
            <Switch checked={true} disabled />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">البريد الإلكتروني</Label>
            <Switch checked={true} disabled />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <Label className="text-sm">رقم الجوال</Label>
            <Switch checked={true} disabled />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">الاسم بالإنجليزي</Label>
            <Switch 
              checked={formData.registration_fields.english_name}
              onCheckedChange={(checked) => handleFieldChange('english_name', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">المستوى التعليمي</Label>
            <Switch 
              checked={formData.registration_fields.education_level}
              onCheckedChange={(checked) => handleFieldChange('education_level', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">تاريخ الميلاد</Label>
            <Switch 
              checked={formData.registration_fields.birth_date}
              onCheckedChange={(checked) => handleFieldChange('birth_date', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">رقم الهوية</Label>
            <Switch 
              checked={formData.registration_fields.national_id}
              onCheckedChange={(checked) => handleFieldChange('national_id', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">الجنس</Label>
            <Switch 
              checked={formData.registration_fields.gender}
              onCheckedChange={(checked) => handleFieldChange('gender', checked)}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm">الحالة الوظيفية</Label>
            <Switch 
              checked={formData.registration_fields.work_status}
              onCheckedChange={(checked) => handleFieldChange('work_status', checked)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};