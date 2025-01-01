import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ReportNameFieldProps {
  value: string;
  programName: string;
  onChange: (value: string) => void;
  onProgramNameChange: (value: string) => void;
}

export const ReportNameField = ({ 
  value, 
  programName,
  onChange,
  onProgramNameChange 
}: ReportNameFieldProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="program_name">اسم البرنامج/المشروع</Label>
        <Input
          id="program_name"
          value={programName}
          onChange={(e) => onProgramNameChange(e.target.value)}
          placeholder="أدخل اسم البرنامج/المشروع..."
          className="text-right"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="report_name">اسم النشاط</Label>
        <Input
          id="report_name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="أدخل اسم النشاط..."
          className="text-right"
          required
        />
      </div>
    </div>
  );
};