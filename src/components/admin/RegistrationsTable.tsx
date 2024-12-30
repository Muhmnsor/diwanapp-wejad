import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegistrationsTableProps {
  registrations: any[];
  onDeleteRegistration: (id: string) => void;
}

export const RegistrationsTable = ({
  registrations,
  onDeleteRegistration,
}: RegistrationsTableProps) => {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [localRegistrations, setLocalRegistrations] = useState(registrations);

  // Add useEffect to update localRegistrations when registrations prop changes
  useEffect(() => {
    setLocalRegistrations(registrations);
  }, [registrations]);

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
      const { data, error } = await supabase
        .from('registrations')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      // Update local state
      setLocalRegistrations(prevRegistrations => 
        prevRegistrations.map(reg => 
          reg.id === id ? { ...reg, ...editForm } : reg
        )
      );
      
      toast.success('تم تحديث بيانات المسجل بنجاح');
      setEditingId(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    } finally {
      setLoading(false);
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
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="text-right font-semibold">الاسم</TableHead>
            <TableHead className="text-right font-semibold">البريد الإلكتروني</TableHead>
            <TableHead className="text-right font-semibold">رقم الجوال</TableHead>
            <TableHead className="text-right font-semibold">رقم التسجيل</TableHead>
            <TableHead className="text-right font-semibold">تاريخ التسجيل</TableHead>
            <TableHead className="text-center font-semibold w-[100px]">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localRegistrations.map((registration) => (
            <TableRow key={registration.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                {editingId === registration.id ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-right"
                  />
                ) : (
                  registration.name
                )}
              </TableCell>
              <TableCell>
                {editingId === registration.id ? (
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-right"
                    dir="ltr"
                  />
                ) : (
                  registration.email
                )}
              </TableCell>
              <TableCell>
                {editingId === registration.id ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-right"
                    dir="ltr"
                  />
                ) : (
                  registration.phone
                )}
              </TableCell>
              <TableCell>{registration.registration_number}</TableCell>
              <TableCell>
                {new Date(registration.created_at).toLocaleDateString("ar-SA")}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
                  {editingId === registration.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(registration.id)}
                        className="h-8 w-8 p-0"
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                        disabled={loading}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(registration)}
                        className="h-8 w-8 p-0"
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-50 hover:text-red-500"
                        onClick={() => handleDelete(registration.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};