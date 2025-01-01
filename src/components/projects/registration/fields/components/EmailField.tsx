import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EmailField = ({ value, onChange }: EmailFieldProps) => {
  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="email">البريد الإلكتروني</Label>
      <Input
        id="email"
        type="email"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل البريد الإلكتروني"
        required
      />
    </div>
  );
};