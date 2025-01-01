import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkStatusFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const WorkStatusField = ({ value, onChange }: WorkStatusFieldProps) => {
  return (
    <div className="space-y-2 text-right">
      <Label htmlFor="workStatus">الحالة الوظيفية</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="اختر الحالة الوظيفية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="employed">موظف</SelectItem>
          <SelectItem value="unemployed">غير موظف</SelectItem>
          <SelectItem value="student">طالب</SelectItem>
          <SelectItem value="retired">متقاعد</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};