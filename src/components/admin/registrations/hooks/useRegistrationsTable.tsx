import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRegistrationActions } from "../useRegistrationActions";

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

export const useRegistrationsTable = (
  registrations: Registration[],
  onDeleteRegistration: (id: string) => void
) => {
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

  return {
    localRegistrations,
    loading,
    editingId,
    editForm,
    handleEditFormChange,
    handleEdit,
    handleSaveWrapper,
    handleCancel,
    handleDelete,
  };
};