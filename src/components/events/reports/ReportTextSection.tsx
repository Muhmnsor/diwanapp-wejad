import { Textarea } from "@/components/ui/textarea";

interface ReportTextSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export const ReportTextSection = ({ value, onChange }: ReportTextSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">نص التقرير</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب ملخصاً للفعالية متضمناً عدد الحضور، النجاحات، التحديات، وتعليقات المشاركين"
        className="h-32"
        required
      />
    </div>
  );
};