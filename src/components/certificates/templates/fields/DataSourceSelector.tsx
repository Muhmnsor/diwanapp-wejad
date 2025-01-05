import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FIELD_MAPPINGS = {
  registration: [
    { value: 'registration.arabic_name', label: 'الاسم بالعربية' },
    { value: 'registration.english_name', label: 'الاسم بالإنجليزية' },
    { value: 'registration.email', label: 'البريد الإلكتروني' },
    { value: 'registration.phone', label: 'رقم الهاتف' },
  ],
  event: [
    { value: 'event.title', label: 'عنوان الفعالية' },
    { value: 'event.date', label: 'تاريخ الفعالية' },
    { value: 'event.location', label: 'مكان الفعالية' },
  ],
  project: [
    { value: 'project.title', label: 'عنوان المشروع' },
    { value: 'project.start_date', label: 'تاريخ بداية المشروع' },
    { value: 'project.end_date', label: 'تاريخ نهاية المشروع' },
  ],
};

interface DataSourceSelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

export const DataSourceSelector = ({ value, onChange }: DataSourceSelectorProps) => {
  console.log('DataSourceSelector render:', { value });

  return (
    <div>
      <Label>مصدر البيانات</Label>
      <Select
        value={value}
        onValueChange={(newValue) => {
          console.log('DataSourceSelector change:', newValue);
          onChange(newValue);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر مصدر البيانات" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="" disabled>اختر مصدر البيانات</SelectItem>
          {Object.entries(FIELD_MAPPINGS).map(([category, mappings]) => (
            <div key={category}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                {category === 'registration' ? 'بيانات التسجيل' : 
                 category === 'event' ? 'بيانات الفعالية' : 'بيانات المشروع'}
              </div>
              {mappings.map((mapping) => (
                <SelectItem key={mapping.value} value={mapping.value}>
                  {mapping.label}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};