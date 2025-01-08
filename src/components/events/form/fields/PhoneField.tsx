import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PhoneField = ({ value, onChange, error }: PhoneFieldProps) => {
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
        console.log('Invalid phone number format');
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label className="block">رقم الجوال</Label>
      <Input
        type="tel"
        value={value || ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="05xxxxxxxx"
        className={error ? "border-red-500" : ""}
        required
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};