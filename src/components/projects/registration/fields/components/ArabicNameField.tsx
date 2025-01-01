import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ArabicNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const ArabicNameField = ({ value, onChange }: ArabicNameFieldProps) => {
  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="arabicName">الاسم الثلاثي بالعربية</Label>
      <Input
        id="arabicName"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل الاسم الثلاثي بالعربية"
        required
      />
    </div>
  );
};