import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataSourceSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export const DataSourceSelector = ({ value, onChange }: DataSourceSelectorProps) => {
  console.log('DataSourceSelector render:', { value });
  
  const handleValueChange = (newValue: string) => {
    console.log('DataSourceSelector change:', newValue);
    onChange(newValue);
  };

  const dataSources = [
    {
      label: "بيانات التسجيل",
      options: [
        { value: "registration.arabic_name", label: "الاسم بالعربية" },
        { value: "registration.english_name", label: "الاسم بالإنجليزية" },
        { value: "registration.email", label: "البريد الإلكتروني" },
        { value: "registration.phone", label: "رقم الجوال" },
        { value: "registration.education_level", label: "المستوى التعليمي" },
        { value: "registration.birth_date", label: "تاريخ الميلاد" },
        { value: "registration.national_id", label: "رقم الهوية" },
        { value: "registration.gender", label: "الجنس" },
        { value: "registration.work_status", label: "الحالة الوظيفية" },
        { value: "registration.registration_number", label: "رقم التسجيل" }
      ]
    },
    {
      label: "بيانات الفعالية",
      options: [
        { value: "event.title", label: "عنوان الفعالية" },
        { value: "event.date", label: "تاريخ الفعالية" },
        { value: "event.location", label: "مكان الفعالية" },
        { value: "event.event_hours", label: "عدد الساعات" }
      ]
    }
  ];

  return (
    <div>
      <Label>مصدر البيانات</Label>
      <Select
        value={value}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر مصدر البيانات" />
        </SelectTrigger>
        <SelectContent>
          {dataSources.map((group) => (
            <div key={group.label} className="px-2 py-1.5">
              <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                {group.label}
              </h3>
              {group.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="pl-8"
                >
                  {option.label}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};