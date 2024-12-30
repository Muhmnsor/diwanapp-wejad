import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
          {registrations.map((registration) => (
            <TableRow key={registration.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">{registration.name}</TableCell>
              <TableCell>{registration.email}</TableCell>
              <TableCell>{registration.phone}</TableCell>
              <TableCell>{registration.registration_number}</TableCell>
              <TableCell>
                {new Date(registration.created_at).toLocaleDateString("ar-SA")}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-50 hover:text-red-500"
                  onClick={() => handleDelete(registration.id)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};