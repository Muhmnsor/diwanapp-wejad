import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DetailedDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const DetailedDescriptionField = ({ value, onChange }: DetailedDescriptionFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="detailed_description">تفاصيل الفعالية الدقيقة</Label>
      <Textarea
        id="detailed_description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب تفاصيل الفعالية بشكل دقيق..."
        className="h-32"
        required
      />
    </div>
  );
};