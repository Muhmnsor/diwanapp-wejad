import { TableRow } from "@/components/ui/table";
import { RegistrationName } from "./RegistrationName";
import { RegistrationContact } from "./RegistrationContact";
import { RegistrationActions } from "./RegistrationActions";

interface Registration {
  id: string;
  arabic_name: string;
  email: string;
  phone: string;
}

interface RegistrationTableRowProps {
  registration: Registration;
  editingId: string | null;
  editForm: {
    name: string;
    email: string;
    phone: string;
  };
  loading: boolean;
  onEdit: (registration: Registration) => void;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
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
  console.log('Registration data:', registration);
  console.log('Edit form data:', editForm);
  
  const isEditing = editingId === registration.id;
  
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
        onEdit={() => onEdit(registration)}
        onDelete={() => onDelete(registration.id)}
        onSave={() => onSave(registration.id)}
        onCancel={onCancel}
      />
    </TableRow>
  );
};