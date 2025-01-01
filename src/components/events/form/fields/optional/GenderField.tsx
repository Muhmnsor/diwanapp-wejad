import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenderFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const GenderField = ({ value, onChange }: GenderFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>الجنس</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="اختر الجنس" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male">ذكر</SelectItem>
          <SelectItem value="female">أنثى</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};