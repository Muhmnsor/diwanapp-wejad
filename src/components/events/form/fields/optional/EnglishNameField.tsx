import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EnglishNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EnglishNameField = ({ value, onChange }: EnglishNameFieldProps) => {
  const [error, setError] = useState<string>("");

  const validateEnglishName = (value: string) => {
    const englishRegex = /^[A-Za-z\s]+$/;
    if (!englishRegex.test(value)) {
      setError("يرجى إدخال الاسم باللغة الإنجليزية فقط");
      return false;
    }
    setError("");
    return true;
  };

  const handleChange = (value: string) => {
    if (validateEnglishName(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label>الاسم الثلاثي بالإنجليزية</Label>
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter full name in English"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};