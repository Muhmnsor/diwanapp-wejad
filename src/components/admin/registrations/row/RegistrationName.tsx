import { TableCell } from "@/components/ui/table";

interface RegistrationNameProps {
  arabicName: string;
  isEditing: boolean;
  editForm: { name: string };
  onEditFormChange: (field: string, value: string) => void;
}

export const RegistrationName = ({
  arabicName,
  isEditing,
  editForm,
  onEditFormChange,
}: RegistrationNameProps) => {
  console.log('RegistrationName - Arabic Name:', arabicName);
  console.log('RegistrationName - Edit Form Name:', editForm.name);

  if (isEditing) {
    return (
      <TableCell>
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => onEditFormChange("name", e.target.value)}
          className="w-full p-2 border rounded"
        />
      </TableCell>
    );
  }

  return (
    <TableCell>
      {arabicName || "لا يوجد اسم"}
    </TableCell>
  );
};