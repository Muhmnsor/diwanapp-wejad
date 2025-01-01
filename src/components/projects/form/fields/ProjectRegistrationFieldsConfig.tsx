import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Project } from "@/types/project";

interface ProjectRegistrationFieldsConfigProps {
  formData: Project;
  setFormData: (data: Project) => void;
}

export const ProjectRegistrationFieldsConfig = ({
  formData,
  setFormData,
}: ProjectRegistrationFieldsConfigProps) => {
  const updateField = (field: string, value: boolean) => {
    console.log('Updating registration field:', field, value);
    
    setFormData({
      ...formData,
      registration_fields: {
        ...formData.registration_fields,
        [field]: value,
      },
    });
  };

  const fields = [
    { id: "arabic_name", label: "الاسم الثلاثي بالعربية", required: true },
    { id: "phone", label: "رقم الجوال", required: true },
    { id: "email", label: "البريد الإلكتروني", required: true },
    { id: "english_name", label: "الاسم الثلاثي بالإنجليزية" },
    { id: "national_id", label: "رقم الهوية" },
    { id: "gender", label: "الجنس" },
    { id: "education_level", label: "المستوى التعليمي" },
    { id: "birth_date", label: "تاريخ الميلاد" },
    { id: "work_status", label: "الحالة الوظيفية" },
  ];

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">معلومات التسجيل المطلوبة</h2>
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox
              id={field.id}
              checked={field.required || formData.registration_fields?.[field.id as keyof typeof formData.registration_fields]}
              onCheckedChange={(checked) => updateField(field.id, checked as boolean)}
              disabled={field.required}
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