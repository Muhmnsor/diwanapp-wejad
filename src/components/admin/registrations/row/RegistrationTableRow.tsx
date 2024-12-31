import { TableRow } from "@/components/ui/table";
import { RegistrationName } from "./RegistrationName";
import { RegistrationContact } from "./RegistrationContact";
import { RegistrationActions } from "./RegistrationActions";

interface RegistrationTableRowProps {
  registration: {
    id: string;
    arabic_name: string;
    email: string;
    phone: string;
    event?: any;
    project?: any;
  };
  editingId: string | null;
  editForm: any;
  loading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditFormChange: (field: string, value: string) => void;
}

export const RegistrationTableRow = ({
  registration,
  editingId,
  editForm,
  loading,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditFormChange,
}: RegistrationTableRowProps) => {
  const isEditing = editingId === registration.id;

  return (
    <TableRow>
      <RegistrationName
        arabicName={registration.arabic_name}
        isEditing={isEditing}
        editForm={editForm}
        onEditFormChange={onEditFormChange}
      />
      <RegistrationContact
        email={registration.email}
        phone={registration.phone}
        isEditing={isEditing}
        editForm={editForm}
        onEditFormChange={onEditFormChange}
      />
      <RegistrationActions
        isEditing={isEditing}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onSave={onSave}
        onCancel={onCancel}
      />
    </TableRow>
  );
};