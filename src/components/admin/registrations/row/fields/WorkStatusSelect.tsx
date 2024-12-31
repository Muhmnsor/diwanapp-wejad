import { TableCell } from "@/components/ui/table";

interface WorkStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  workStatus?: string;
}

export const WorkStatusSelect = ({
  value,
  onChange,
  isEditing,
  workStatus
}: WorkStatusSelectProps) => {
  const { translateWorkStatus } = require('../utils/translations');

  if (isEditing) {
    return (
      <TableCell>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">اختر</option>
          <option value="employed">موظف</option>
          <option value="unemployed">غير موظف</option>
          <option value="student">طالب</option>
          <option value="retired">متقاعد</option>
        </select>
      </TableCell>
    );
  }

  return (
    <TableCell>
      {translateWorkStatus(workStatus)}
    </TableCell>
  );
};