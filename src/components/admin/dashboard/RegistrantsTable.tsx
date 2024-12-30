import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegistrantStats {
  name: string;
  attendedActivities: number;
  totalActivities: number;
  attendancePercentage: number;
  id: string;
  email: string;
  phone: string;
}

interface RegistrantsTableProps {
  registrantsStats: RegistrantStats[];
  isLoading: boolean;
}

export const RegistrantsTable = ({ registrantsStats, isLoading }: RegistrantsTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  console.log('RegistrantsTable - stats:', registrantsStats);
  
  if (isLoading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  if (!registrantsStats?.length) {
    return <div className="text-center py-4">لا يوجد مسجلين في هذا المشروع</div>;
  }

  const handleEdit = (registrant: RegistrantStats) => {
    setEditingId(registrant.id);
    setEditForm({
      name: registrant.name,
      email: registrant.email,
      phone: registrant.phone,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({ name: "", email: "", phone: "" });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('تم تحديث بيانات المسجل بنجاح');
      setEditingId(null);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4 text-right">احصائيات الحضور</h3>
      <Table dir="rtl">
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="text-right w-[50px]">م</TableHead>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">البريد الإلكتروني</TableHead>
            <TableHead className="text-right">رقم الجوال</TableHead>
            <TableHead className="text-right">عدد الأنشطة التي حضرها</TableHead>
            <TableHead className="text-right">نسبة الحضور</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrantsStats.map((registrant: RegistrantStats, index: number) => (
            <TableRow 
              key={registrant.id}
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <TableCell className="text-right text-gray-500">{index + 1}</TableCell>
              <TableCell className="text-right">
                {editingId === registrant.id ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-right"
                  />
                ) : (
                  registrant.name
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === registrant.id ? (
                  <Input
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full text-right"
                    dir="ltr"
                  />
                ) : (
                  registrant.email
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === registrant.id ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full text-right"
                    dir="ltr"
                  />
                ) : (
                  registrant.phone
                )}
              </TableCell>
              <TableCell className="text-right">
                {registrant.attendedActivities} من {registrant.totalActivities}
              </TableCell>
              <TableCell className="text-right w-[200px]">
                <div className="flex items-center gap-2">
                  <Progress value={registrant.attendancePercentage} className="h-2" />
                  <span className="text-sm text-gray-500">
                    {Math.round(registrant.attendancePercentage)}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-end">
                  {editingId === registrant.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(registrant.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(registrant)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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