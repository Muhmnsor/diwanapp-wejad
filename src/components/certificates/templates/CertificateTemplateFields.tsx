import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Move } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CertificateTemplateFieldsProps {
  fields: Record<string, string>;
  onChange: (fields: Record<string, string>) => void;
}

export const CertificateTemplateFields = ({
  fields,
  onChange
}: CertificateTemplateFieldsProps) => {
  const [newField, setNewField] = useState({ key: '', value: '' });

  const handleAddField = () => {
    if (!newField.key.trim() || !newField.value.trim()) {
      toast.error("الرجاء إدخال اسم وقيمة الحقل");
      return;
    }

    if (fields[newField.key]) {
      toast.error("هذا الحقل موجود مسبقاً");
      return;
    }

    onChange({ ...fields, [newField.key]: newField.value });
    setNewField({ key: '', value: '' });
    toast.success("تم إضافة الحقل بنجاح");
  };

  const handleRemoveField = (key: string) => {
    const updatedFields = { ...fields };
    delete updatedFields[key];
    onChange(updatedFields);
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

        <div className="flex items-center gap-2">
          <Input
            placeholder="اسم الحقل"
            value={newField.key}
            onChange={(e) => setNewField({ ...newField, key: e.target.value })}
            className="flex-1"
          />
          <Input
            placeholder="قيمة الحقل"
            value={newField.value}
            onChange={(e) => setNewField({ ...newField, value: e.target.value })}
            className="flex-1"
          />
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