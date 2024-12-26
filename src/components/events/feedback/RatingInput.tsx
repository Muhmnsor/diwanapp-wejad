import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RatingInputProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}

export const RatingInput = ({ label, value, onChange }: RatingInputProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <RadioGroup
        value={value?.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
        className="flex gap-4"
      >
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="flex items-center space-x-2">
            <RadioGroupItem value={rating.toString()} id={`${label}-${rating}`} />
            <Label htmlFor={`${label}-${rating}`}>{rating}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};