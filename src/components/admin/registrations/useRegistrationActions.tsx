import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationActions = (onRegistrationDeleted: (id: string) => void) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleEdit = (registration: any) => {
    console.log('Editing registration:', registration);
    setEditingId(registration.id);
    setEditForm({
      name: registration.arabic_name || "",
      email: registration.email || "",
      phone: registration.phone || "",
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      console.log('Saving registration with data:', editForm);
      const { error } = await supabase
        .from('registrations')
        .update({
          arabic_name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        })
        .eq('id', editingId);

      if (error) throw error;

      toast.success('تم تحديث التسجيل بنجاح');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('حدث خطأ أثناء تحديث التسجيل');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      email: "",
      phone: "",
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('تم حذف التسجيل بنجاح');
      onRegistrationDeleted(id);
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast.error('حدث خطأ أثناء حذف التسجيل');
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    console.log('Updating form field:', field, 'with value:', value);
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    editingId,
    editForm,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleEditFormChange,
  };
};