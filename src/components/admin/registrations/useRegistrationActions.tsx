import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useRegistrationActions = (onDeleteRegistration: (id: string) => void) => {
  const [loading, setLoading] = useState(false);
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
      name: registration.arabic_name,
      email: registration.email,
      phone: registration.phone,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: "", email: "", phone: "" });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التسجيل؟")) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from("registrations")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast.success("تم حذف التسجيل بنجاح");
        onDeleteRegistration(id);
      } catch (error) {
        console.error("Error deleting registration:", error);
        toast.error("حدث خطأ أثناء حذف التسجيل");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async (id: string) => {
    setLoading(true);
    try {
      console.log('Saving registration with data:', { id, editForm });
      
      const { data, error } = await supabase
        .from("registrations")
        .update({
          arabic_name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      console.log('Updated registration:', data);
      toast.success("تم تحديث التسجيل بنجاح");
      setEditingId(null);
      return data;
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("حدث خطأ أثناء تحديث التسجيل");
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