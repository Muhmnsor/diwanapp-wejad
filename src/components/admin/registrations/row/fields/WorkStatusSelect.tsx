import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkStatusSelectProps {
  value: string;
  isEditing: boolean;
  workStatus: string | null;
  onChange: (value: string) => void;
}

export const WorkStatusSelect = ({
  value,
  isEditing,
  workStatus,
  onChange,
}: WorkStatusSelectProps) => {
  if (!isEditing) {
    return <td className="p-4">{workStatus || '-'}</td>;
  }

  return (
    <td className="p-4">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="الحالة الوظيفية" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="employed">موظف</SelectItem>
          <SelectItem value="unemployed">عاطل عن العمل</SelectItem>
          <SelectItem value="student">طالب</SelectItem>
          <SelectItem value="retired">متقاعد</SelectItem>
        </SelectContent>
      </Select>
    </td>
  );
};