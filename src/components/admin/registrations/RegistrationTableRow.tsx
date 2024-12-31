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
  editForm,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onEditFormChange,
}: RegistrationTableRowProps) => {
  console.log('Registration data:', registration);
  console.log('Edit form data:', editForm);
  
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
        onEdit={onEdit}
        onDelete={onDelete}
        onSave={onSave}
        onCancel={onCancel}
      />
    </TableRow>
  );
};