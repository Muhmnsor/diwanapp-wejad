import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationActions = (onDeleteRegistration: (id: string) => void) => {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      onDeleteRegistration(id);
      toast.success("تم حذف التسجيل بنجاح");
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast.error("حدث خطأ أثناء حذف التسجيل");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (registration: any) => {
    setEditingId(registration.id);
    setEditForm({
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: "", email: "", phone: "" });
  };

  const handleSave = async (id: string) => {
    try {
      setLoading(true);
      console.log("Updating registration with data:", editForm);
      
      const { data, error } = await supabase
        .from('registrations')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error("Error updating registration:", error);
        throw error;
      }

      console.log("Update response:", data);
      toast.success('تم تحديث بيانات المسجل بنجاح');
      setEditingId(null);
      return data[0];
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    editingId,
    editForm,
    setEditForm,
    handleDelete,
    handleEdit,
    handleCancel,
    handleSave,
  };
};