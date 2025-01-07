import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkStatusFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const WorkStatusField = ({ value, onChange }: WorkStatusFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>الحالة الوظيفية</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="اختر الحالة الوظيفية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">طالب/ة</SelectItem>
          <SelectItem value="employed">موظف/ة</SelectItem>
          <SelectItem value="self_employed">عمل حر</SelectItem>
          <SelectItem value="unemployed">غير موظف/ة</SelectItem>
          <SelectItem value="retired">متقاعد/ة</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};