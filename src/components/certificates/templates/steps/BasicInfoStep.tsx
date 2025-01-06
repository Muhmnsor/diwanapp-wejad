import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoStepProps {
  name: string;
  description: string;
  onChange: (field: string, value: string) => void;
}

export const BasicInfoStep = ({ name, description, onChange }: BasicInfoStepProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم القالب</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          required
          className="text-right"
          placeholder="أدخل اسم القالب"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف القالب</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          className="text-right min-h-[100px]"
          placeholder="أدخل وصفاً للقالب"
        />
      </div>
    </Card>
  );
};