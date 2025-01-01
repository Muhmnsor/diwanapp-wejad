import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EnglishNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EnglishNameField = ({ value, onChange }: EnglishNameFieldProps) => {
  const [error, setError] = useState("");

  const handleChange = (newValue: string) => {
    const englishRegex = /^[A-Za-z\s]*$/;
    
    if (newValue && !englishRegex.test(newValue)) {
      setError("يرجى إدخال الاسم باللغة الإنجليزية فقط");
      return;
    }
    
    setError("");
    onChange(newValue);
  };

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="englishName">الاسم الثلاثي بالإنجليزية</Label>
      <Input
        id="englishName"
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Enter your full name in English"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};