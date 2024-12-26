import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReportNameFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const ReportNameField = ({ value, onChange }: ReportNameFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="report_name">اسم الفعالية</Label>
      <Input
        id="report_name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أدخل اسم الفعالية..."
        className="text-right"
        required
      />
    </div>
  );
};