import { useState, useEffect } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { RegistrationTableHeader } from "./registrations/RegistrationTableHeader";
import { RegistrationTableRow } from "./registrations/row/RegistrationTableRow";
import { useRegistrationActions } from "./registrations/useRegistrationActions";
import { useQueryClient } from "@tanstack/react-query";

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
  const [localRegistrations, setLocalRegistrations] = useState<Registration[]>(registrations);
  const queryClient = useQueryClient();
  
  const {
    loading,
    editingId,
    editForm,
    setEditForm,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
  } = useRegistrationActions(onDeleteRegistration);

  useEffect(() => {
    setLocalRegistrations(registrations);
  }, [registrations]);

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveWrapper = async (id: string) => {
    try {
      const updatedRegistration = await handleSave(id);
      if (updatedRegistration) {
        setLocalRegistrations(prevRegistrations =>
          prevRegistrations.map(reg =>
            reg.id === id ? { ...reg, ...updatedRegistration } : reg
          )
        );
        queryClient.invalidateQueries({ queryKey: ['registrations'] });
      }
    } catch (error) {
      console.error("Error in handleSaveWrapper:", error);
    }
  };

  if (!registrations.length) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50">
        لا يوجد تسجيلات حتى الآن
      </div>
    );
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
              editingId={editingId}
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