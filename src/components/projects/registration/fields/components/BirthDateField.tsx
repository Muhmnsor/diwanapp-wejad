import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BirthDateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const BirthDateField = ({ value, onChange }: BirthDateFieldProps) => {
  return (
    <div>
      <Label htmlFor="birthDate">تاريخ الميلاد</Label>
      <Input
        id="birthDate"
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};