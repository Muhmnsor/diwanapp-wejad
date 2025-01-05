import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FieldTypeSelectorProps {
  value: 'mapped' | 'free';
  onChange: (value: 'mapped' | 'free') => void;
}

export const FieldTypeSelector = ({ value, onChange }: FieldTypeSelectorProps) => {
  console.log('FieldTypeSelector render:', { value });
  
  return (
    <div>
      <Label>نوع الحقل</Label>
      <Select
        value={value}
        onValueChange={(value: 'mapped' | 'free') => {
          console.log('FieldTypeSelector change:', value);
          onChange(value);
        }}
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