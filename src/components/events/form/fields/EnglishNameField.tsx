import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EnglishNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EnglishNameField = ({ value, onChange, error }: EnglishNameFieldProps) => {
  console.log('🔤 EnglishNameField - Current value:', value);
  
  return (
    <div className="space-y-2">
      <Label className="block">الاسم الثلاثي بالإنجليزية</Label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your full name in English"
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};