import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneField = ({ value, onChange }: PhoneFieldProps) => {
  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="phone">رقم الجوال</Label>
      <Input
        id="phone"
        type="tel"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل رقم الجوال"
        required
      />
    </div>
  );
};