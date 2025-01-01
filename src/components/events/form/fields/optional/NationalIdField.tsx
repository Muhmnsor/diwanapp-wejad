import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface NationalIdFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const NationalIdField = ({ value, onChange }: NationalIdFieldProps) => {
  const [error, setError] = useState<string>("");

  const validateNationalId = (value: string) => {
    const nationalIdRegex = /^\d{10}$/;
    if (!nationalIdRegex.test(value)) {
      setError("يجب أن يتكون رقم الهوية من 10 أرقام");
      return false;
    }
    setError("");
    return true;
  };

  const handleChange = (value: string) => {
    if (validateNationalId(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label>رقم الهوية</Label>
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="أدخل رقم الهوية"
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};