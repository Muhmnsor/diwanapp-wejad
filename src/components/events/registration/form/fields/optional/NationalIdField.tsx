import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface NationalIdFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const NationalIdField = ({ value, onChange }: NationalIdFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>رقم الهوية</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل رقم الهوية"
      />
    </div>
  );
};