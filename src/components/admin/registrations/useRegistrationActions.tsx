import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Registration {
  id: string;
  arabic_name: string;
  email: string;
  phone: string;
}

export const useRegistrationActions = (onRegistrationDeleted: (id: string) => void) => {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleEdit = (registration: Registration) => {
    console.log('Editing registration:', registration);
    setEditingId(registration.id);
    setEditForm({
      name: registration.arabic_name || "",
      email: registration.email || "",
      phone: registration.phone || "",
    });
  };

  const handleSave = async (id: string) => {
    if (!id) return;
    setLoading(true);

    try {
      console.log('Saving registration with data:', editForm);
      const { error } = await supabase
        .from('registrations')
        .update({
          arabic_name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('تم تحديث التسجيل بنجاح');
      setEditingId(null);
      return { ...editForm };
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('حدث خطأ أثناء تحديث التسجيل');
      throw error;
    } finally {
      setLoading(false);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
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
    loading,
    editingId,
    editForm,
    setEditForm,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleEditFormChange,
  };
};