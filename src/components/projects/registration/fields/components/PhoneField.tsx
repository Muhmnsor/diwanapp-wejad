
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
    // Only allow numbers and limit to 10 digits
    if (!/^\d*$/.test(newValue) || newValue.length > 10) {
      return;
    }

    // Always update the value if it's numbers only
    onChange(newValue);
    
    // Validate only if there's a value
    if (newValue) {
      const phoneRegex = /^05\d{8}$/;
      if (!phoneRegex.test(newValue)) {
        setError("يجب أن يبدأ رقم الجوال ب 05 ويتكون من 10 أرقام");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="phone">رقم الجوال</Label>
      <Input
        id="phone"
        type="tel"
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="05xxxxxxxx"
        className={error ? "border-red-500" : ""}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
