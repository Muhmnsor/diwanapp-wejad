import { TableCell } from "@/components/ui/table";

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  gender?: string;
}

export const GenderSelect = ({
  value,
  onChange,
  isEditing,
  gender
}: GenderSelectProps) => {
  const translateGender = (g?: string) => {
    return g === 'male' ? 'ذكر' : g === 'female' ? 'أنثى' : '-';
  };

  if (isEditing) {
    return (
      <TableCell>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">اختر</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
      </TableCell>
    );
  }

  return (
    <TableCell>
      {translateGender(gender)}
    </TableCell>
  );
};