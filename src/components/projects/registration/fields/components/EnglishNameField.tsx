import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EnglishNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EnglishNameField = ({ value, onChange }: EnglishNameFieldProps) => {
  return (
    <div>
      <Label htmlFor="englishName">الاسم الثلاثي بالإنجليزية</Label>
      <Input
        id="englishName"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your full name in English"
      />
    </div>
  );
};