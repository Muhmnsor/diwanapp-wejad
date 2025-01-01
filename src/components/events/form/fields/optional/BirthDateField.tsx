import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BirthDateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const BirthDateField = ({ value, onChange }: BirthDateFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>تاريخ الميلاد</Label>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};