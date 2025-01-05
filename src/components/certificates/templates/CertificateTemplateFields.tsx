import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Move } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Field {
  key: string;
  value: string;
  type: 'mapped' | 'free';
  mapping?: string;
}

interface CertificateTemplateFieldsProps {
  fields: Record<string, string>;
  fieldMappings: Record<string, string>;
  onChange: (fields: Record<string, string>, fieldMappings: Record<string, string>) => void;
}

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

export const CertificateTemplateFields = ({
  fields,
  fieldMappings,
  onChange
}: CertificateTemplateFieldsProps) => {
  const [newField, setNewField] = useState<Field>({ 
    key: '', 
    value: '', 
    type: 'free' 
  });

  const handleAddField = () => {
    if (!newField.key.trim()) {
      toast.error("الرجاء إدخال اسم الحقل");
      return;
    }

    if (fields[newField.key]) {
      toast.error("هذا الحقل موجود مسبقاً");
      return;
    }

    const updatedFields = { ...fields };
    const updatedMappings = { ...fieldMappings };

    if (newField.type === 'mapped' && newField.mapping) {
      updatedFields[newField.key] = `{${newField.mapping}}`;
      updatedMappings[newField.key] = newField.mapping;
    } else {
      updatedFields[newField.key] = newField.value;
    }

    onChange(updatedFields, updatedMappings);
    setNewField({ key: '', value: '', type: 'free' });
    toast.success("تم إضافة الحقل بنجاح");
  };

  const handleRemoveField = (key: string) => {
    const updatedFields = { ...fields };
    const updatedMappings = { ...fieldMappings };
    delete updatedFields[key];
    delete updatedMappings[key];
    onChange(updatedFields, updatedMappings);
    toast.success("تم حذف الحقل بنجاح");
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">حقول القالب</h3>
        <span className="text-sm text-muted-foreground">
          {Object.keys(fields).length} حقول
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(fields).map(([key, value], index) => (
          <div key={key} className="group relative flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50">
            <Move className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <Input value={key} disabled className="flex-1" />
            <Input value={value} disabled className="flex-1" />
            {fieldMappings[key] && (
              <span className="text-sm text-muted-foreground">
                (مربوط: {fieldMappings[key]})
              </span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveField(key)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نوع الحقل</Label>
              <Select
                value={newField.type}
                onValueChange={(value: 'mapped' | 'free') => 
                  setNewField({ ...newField, type: value, mapping: undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحقل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">حقل حر</SelectItem>
                  <SelectItem value="mapped">حقل مربوط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newField.type === 'mapped' && (
              <div>
                <Label>مصدر البيانات</Label>
                <Select
                  value={newField.mapping}
                  onValueChange={(value) => setNewField({ ...newField, mapping: value })}
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
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="اسم الحقل"
              value={newField.key}
              onChange={(e) => setNewField({ ...newField, key: e.target.value })}
              className="flex-1"
            />
            {newField.type === 'free' && (
              <Input
                placeholder="القيمة الافتراضية"
                value={newField.value}
                onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                className="flex-1"
              />
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddField}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};