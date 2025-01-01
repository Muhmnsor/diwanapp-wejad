import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface NationalIdFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const NationalIdField = ({ value, onChange }: NationalIdFieldProps) => {
  const [error, setError] = useState("");

  const handleChange = (newValue: string) => {
    // Always update the value
    onChange(newValue);
    
    // Validate only if there's a value
    if (newValue) {
      const idRegex = /^\d{10}$/;
      if (!idRegex.test(newValue)) {
        setError("يجب أن يتكون رقم الهوية من 10 أرقام فقط");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="nationalId">رقم الهوية</Label>
      <Input
        id="nationalId"
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="أدخل رقم الهوية"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};