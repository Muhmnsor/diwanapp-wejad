import { Input } from "@/components/ui/input";

interface TextInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const TextInputField = ({
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  className
}: TextInputFieldProps) => {
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      placeholder={placeholder}
      required={required}
    />
  );
};