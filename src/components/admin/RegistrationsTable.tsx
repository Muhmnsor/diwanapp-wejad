import { Table, TableBody } from "@/components/ui/table";
import { RegistrationTableHeader } from "./registrations/RegistrationTableHeader";
import { RegistrationTableRow } from "./registrations/row/RegistrationTableRow";
import { EmptyState } from "./registrations/components/EmptyState";
import { useRegistrationsTable } from "./registrations/hooks/useRegistrationsTable";

interface Registration {
  id: string;
  arabic_name: string;
  english_name?: string;
  email: string;
  phone: string;
  education_level?: string;
  birth_date?: string;
  national_id?: string;
  gender?: string;
  work_status?: string;
  registration_number: string;
  created_at: string;
  event?: any;
  project?: any;
}

interface RegistrationsTableProps {
  registrations: Registration[];
  onDeleteRegistration: (id: string) => void;
}

export const RegistrationsTable = ({
  registrations,
  onDeleteRegistration,
}: RegistrationsTableProps) => {
  const {
    localRegistrations,
    loading,
    editingId,
    editForm,
    handleEditFormChange,
    handleEdit,
    handleSaveWrapper,
    handleCancel,
    handleDelete,
  } = useRegistrationsTable(registrations, onDeleteRegistration);

  if (!registrations.length) {
    return <EmptyState />;
  }

  return (
    <div className="w-full overflow-auto">
      <Table dir="rtl">
        <RegistrationTableHeader />
        <TableBody>
          {localRegistrations.map((registration) => (
            <RegistrationTableRow
              key={registration.id}
              registration={registration}
              isEditing={editingId === registration.id}
              editForm={editForm}
              loading={loading}
              onEdit={() => handleEdit(registration)}
              onDelete={() => handleDelete(registration.id)}
              onSave={() => handleSaveWrapper(registration.id)}
              onCancel={handleCancel}
              onEditFormChange={handleEditFormChange}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};