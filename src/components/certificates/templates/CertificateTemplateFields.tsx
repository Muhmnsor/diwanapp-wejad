import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FieldTypeSelector } from "./fields/FieldTypeSelector";
import { DataSourceSelector } from "./fields/DataSourceSelector";
import { FieldsList } from "./fields/FieldsList";

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

  console.log('CertificateTemplateFields render:', { fields, fieldMappings, newField });

  const handleAddField = () => {
    try {
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
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error("حدث خطأ أثناء إضافة الحقل");
    }
  };

  const handleRemoveField = (key: string) => {
    try {
      const updatedFields = { ...fields };
      const updatedMappings = { ...fieldMappings };
      delete updatedFields[key];
      delete updatedMappings[key];
      onChange(updatedFields, updatedMappings);
      toast.success("تم حذف الحقل بنجاح");
    } catch (error) {
      console.error('Error removing field:', error);
      toast.error("حدث خطأ أثناء حذف الحقل");
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">حقول القالب</h3>
        <span className="text-sm text-muted-foreground">
          {Object.keys(fields).length} حقول
        </span>
      </div>

      <FieldsList 
        fields={fields}
        fieldMappings={fieldMappings}
        onRemoveField={handleRemoveField}
      />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FieldTypeSelector
            value={newField.type}
            onChange={(value) => {
              console.log('Field type changed:', value);
              setNewField({ ...newField, type: value, mapping: undefined });
            }}
          />

          {newField.type === 'mapped' && (
            <DataSourceSelector
              value={newField.mapping}
              onChange={(value) => {
                console.log('Data source changed:', value);
                setNewField({ ...newField, mapping: value });
              }}
            />
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
    </Card>
  );
};