import { TableRow } from "@/components/ui/table";
import { RegistrationName } from "./row/RegistrationName";
import { RegistrationContact } from "./row/RegistrationContact";
import { RegistrationActions } from "./row/RegistrationActions";

interface RegistrationTableRowProps {
  registration: {
    id: string;
    arabic_name: string;
    email: string;
    phone: string;
  };
  isEditing: boolean;
  loading: boolean;
  editForm: {
    name: string;
    email: string;
    phone: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onSave: () => void;
  onCancel: () => void;
  onEditFormChange: (field: string, value: string) => void;
}

export const RegistrationTableRow = ({
  registration,
  isEditing,
  loading,
  editForm,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditFormChange,
}: RegistrationTableRowProps) => {
  return (
    <TableRow key={registration.id} className="hover:bg-gray-50">
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