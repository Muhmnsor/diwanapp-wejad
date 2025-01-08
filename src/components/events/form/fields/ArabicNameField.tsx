import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ArabicNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const ArabicNameField = ({ value, onChange, error }: ArabicNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="block">الاسم الثلاثي بالعربية</Label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل الاسم الثلاثي بالعربية"
        className={error ? "border-red-500" : ""}
        required
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};