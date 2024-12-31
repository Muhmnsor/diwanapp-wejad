import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
}

export const FormField = ({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};