import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ArabicNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const ArabicNameField = ({ value, onChange }: ArabicNameFieldProps) => {
  const [error, setError] = useState("");

  const handleChange = (newValue: string) => {
    const arabicRegex = /^[\u0600-\u06FF\s]*$/;
    
    if (!arabicRegex.test(newValue)) {
      setError("يرجى إدخال الاسم باللغة العربية فقط");
      return;
    }
    
    setError("");
    onChange(newValue);
  };

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="arabicName">الاسم الثلاثي بالعربية</Label>
      <Input
        id="arabicName"
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="أدخل الاسم الثلاثي بالعربية"
        className={error ? "border-red-500" : ""}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};