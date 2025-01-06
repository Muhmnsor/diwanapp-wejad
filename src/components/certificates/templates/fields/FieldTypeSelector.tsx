import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FieldTypeSelectorProps {
  value: 'mapped' | 'free';
  onChange: (value: 'mapped' | 'free') => void;
}

export const FieldTypeSelector = ({ value, onChange }: FieldTypeSelectorProps) => {
  console.log('FieldTypeSelector render:', { value });
  
  const handleValueChange = (newValue: string) => {
    console.log('FieldTypeSelector change:', newValue);
    // Validate the value before passing it to onChange
    if (newValue === 'mapped' || newValue === 'free') {
      onChange(newValue as 'mapped' | 'free');
    } else {
      console.error('Invalid field type value:', newValue);
    }
  };

  return (
    <div>
      <Label>نوع الحقل</Label>
      <Select
        value={value}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="اختر نوع الحقل" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">حقل حر</SelectItem>
          <SelectItem value="mapped">حقل مربوط</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};