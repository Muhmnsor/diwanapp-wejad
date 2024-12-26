import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventObjectivesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const EventObjectivesField = ({ value, onChange }: EventObjectivesFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="event_objectives">أهداف الفعالية</Label>
      <Textarea
        id="event_objectives"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اذكر الأهداف الرئيسية للفعالية..."
        className="h-24"
        required
      />
    </div>
  );
};