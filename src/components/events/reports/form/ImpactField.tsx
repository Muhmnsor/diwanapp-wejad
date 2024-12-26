import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ImpactFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const ImpactField = ({ value, onChange }: ImpactFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="impact_on_participants">الأثر على المشاركين</Label>
      <Textarea
        id="impact_on_participants"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="صف كيف أثرت الفعالية على المشاركين..."
        className="h-24"
        required
      />
    </div>
  );
};