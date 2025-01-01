import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EnglishNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EnglishNameField = ({ value, onChange }: EnglishNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>الاسم الثلاثي بالإنجليزية</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل الاسم الثلاثي بالإنجليزية"
      />
    </div>
  );
};