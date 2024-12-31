import { TableCell } from "@/components/ui/table";

interface TextInputCellProps {
  value: string;
  onChange?: (value: string) => void;
  isEditing: boolean;
  displayValue?: string;
  type?: string;
}

export const TextInputCell = ({
  value,
  onChange,
  isEditing,
  displayValue,
  type = "text"
}: TextInputCellProps) => {
  if (isEditing && onChange) {
    return (
      <TableCell>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </TableCell>
    );
  }

  return (
    <TableCell>
      {displayValue || value || '-'}
    </TableCell>
  );
};