import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneField = ({ value, onChange }: PhoneFieldProps) => {
  const [error, setError] = useState("");

  const handleChange = (newValue: string) => {
    const phoneRegex = /^05\d{8}$/;
    
    if (newValue && !phoneRegex.test(newValue)) {
      setError("يجب أن يبدأ رقم الجوال ب 05 ويتكون من 10 أرقام");
      return;
    }
    
    setError("");
    onChange(newValue);
  };

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="phone">رقم الجوال</Label>
      <Input
        id="phone"
        type="tel"
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="أدخل رقم الجوال"
        className={error ? "border-red-500" : ""}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};