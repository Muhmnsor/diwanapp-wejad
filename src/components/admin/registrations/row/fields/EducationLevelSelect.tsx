import { TableCell } from "@/components/ui/table";

interface EducationLevelSelectProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  educationLevel?: string;
}

export const EducationLevelSelect = ({
  value,
  onChange,
  isEditing,
  educationLevel
}: EducationLevelSelectProps) => {
  const { translateEducationLevel } = require('../utils/translations');

  if (isEditing) {
    return (
      <TableCell>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">اختر</option>
          <option value="primary">ابتدائي</option>
          <option value="intermediate">متوسط</option>
          <option value="high_school">ثانوي</option>
          <option value="bachelor">بكالوريوس</option>
          <option value="master">ماجستير</option>
          <option value="phd">دكتوراه</option>
        </select>
      </TableCell>
    );
  }

  return (
    <TableCell>
      {translateEducationLevel(educationLevel)}
    </TableCell>
  );
};