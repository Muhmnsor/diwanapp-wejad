
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenderFieldProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function GenderField({ value, onChange }: GenderFieldProps) {
  // Safe value handling - ensure we never pass empty string as value
  const handleChange = (newValue: string) => {
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="gender">الجنس</Label>
      <Select
        value={value || undefined}
        onValueChange={handleChange}
      >
        <SelectTrigger id="gender">
          <SelectValue placeholder="اختر الجنس" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male">ذكر</SelectItem>
          <SelectItem value="female">أنثى</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
