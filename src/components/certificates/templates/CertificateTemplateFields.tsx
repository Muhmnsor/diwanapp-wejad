import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useState } from "react";

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
    if (newField.key && newField.value) {
      onChange({ ...fields, [newField.key]: newField.value });
      setNewField({ key: '', value: '' });
    }
  };

  const handleRemoveField = (key: string) => {
    const updatedFields = { ...fields };
    delete updatedFields[key];
    onChange(updatedFields);
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold">حقول القالب</h3>

      <div className="space-y-4">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <Input value={key} disabled className="flex-1" />
            <Input value={value} disabled className="flex-1" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveField(key)}
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
          />
          <Input
            placeholder="قيمة الحقل"
            value={newField.value}
            onChange={(e) => setNewField({ ...newField, value: e.target.value })}
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