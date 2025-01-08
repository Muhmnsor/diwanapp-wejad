import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmailFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EmailField = ({ value, onChange, error }: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="block">البريد الإلكتروني</Label>
      <Input
        type="email"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل البريد الإلكتروني"
        className={error ? "border-red-500" : ""}
        required
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};