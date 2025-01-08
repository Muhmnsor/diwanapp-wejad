import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PhoneField = ({ value, onChange, error }: PhoneFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="block">رقم الجوال</Label>
      <Input
        type="tel"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="05xxxxxxxx"
        className={error ? "border-red-500" : ""}
        required
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};