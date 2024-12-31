import { Event } from "@/store/eventStore";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface RegistrationFieldsProps {
  formData: Event;
  setFormData: (data: Event) => void;
}

export const RegistrationFields = ({ formData, setFormData }: RegistrationFieldsProps) => {
  const handleFieldChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      registration_fields: {
        ...formData.registration_fields,
        [field]: checked
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

  const fields = [
    { id: "arabic_name", label: "الاسم الثلاثي بالعربية", required: true },
    { id: "phone", label: "رقم الجوال", required: true },
    { id: "email", label: "البريد الإلكتروني", required: true },
    { id: "english_name", label: "الاسم الثلاثي بالإنجليزية" },
    { id: "national_id", label: "رقم الهوية" },
    { id: "gender", label: "الجنس" },
    { id: "education_level", label: "المستوى التعليمي" },
    { id: "birth_date", label: "تاريخ الميلاد" },
    { id: "work_status", label: "الحالة الوظيفية" }
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">معلومات المستفيدين المطلوبة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox
              id={field.id}
              checked={field.required || formData.registration_fields?.[field.id as keyof typeof formData.registration_fields]}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked as boolean)}
              disabled={field.required}
              className="border-2"
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        ))}
      </div>
    </Card>
  );
};