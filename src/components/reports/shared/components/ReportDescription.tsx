import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const ReportDescription = ({
  value,
  onChange,
  label = "وصف التقرير",
  placeholder = "اكتب وصف التقرير هنا..."
}: ReportDescriptionProps) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[150px]"
      />
    </div>
  );
};