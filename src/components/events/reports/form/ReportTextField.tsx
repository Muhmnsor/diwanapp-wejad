import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportTextFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const ReportTextField = ({ value, onChange }: ReportTextFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="report_text">نص التقرير</Label>
      <Textarea
        id="report_text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب تقريرك هنا..."
        required
      />
    </div>
  );
};