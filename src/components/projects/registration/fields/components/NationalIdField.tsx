import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NationalIdFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const NationalIdField = ({ value, onChange }: NationalIdFieldProps) => {
  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="nationalId">رقم الهوية</Label>
      <Input
        id="nationalId"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل رقم الهوية"
      />
    </div>
  );
};