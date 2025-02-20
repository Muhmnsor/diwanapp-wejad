
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface EnglishNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EnglishNameField = ({ value, onChange, error: propError }: EnglishNameFieldProps) => {
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
    <div className="space-y-2">
      <Label>الاسم الثلاثي بالانجليزية</Label>
      <Input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="أدخل الاسم باللغة الإنجليزية"
        className={error || propError ? "border-red-500" : ""}
      />
      {(error || propError) && (
        <p className="text-sm text-red-500">{error || propError}</p>
      )}
    </div>
  );
};
