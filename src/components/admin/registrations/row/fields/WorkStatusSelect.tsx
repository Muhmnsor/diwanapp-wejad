import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  isEditing?: boolean;
}

export const WorkStatusSelect = ({ value, onChange, isEditing = false }: WorkStatusSelectProps) => {
  const workStatuses = {
    employed: "موظف",
    unemployed: "غير موظف",
    student: "طالب",
    retired: "متقاعد"
  };

  if (!isEditing) {
    return <span>{value ? workStatuses[value as keyof typeof workStatuses] : '-'}</span>;
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="اختر الحالة الوظيفية" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="employed">موظف</SelectItem>
        <SelectItem value="unemployed">غير موظف</SelectItem>
        <SelectItem value="student">طالب</SelectItem>
        <SelectItem value="retired">متقاعد</SelectItem>
      </SelectContent>
    </Select>
  );
};