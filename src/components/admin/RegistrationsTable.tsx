import { Registration } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { QrCode, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ConfirmationCard } from "../events/ConfirmationCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface RegistrationsTableProps {
  registrations: Registration[];
  eventTitle: string;
}

export const RegistrationsTable = ({ registrations, eventTitle }: RegistrationsTableProps) => {
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!Array.isArray(registrations)) {
    console.error('Registrations is not an array:', registrations);
    return <div>خطأ في تحميل البيانات</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-SA');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صالح';
    }
  };

  const formatRegistrationNumber = (number: string) => {
    return number.split('-').pop() || number;
  };

  const handleShowQRCard = (registration: Registration) => {
    setSelectedRegistration(registration);
  };

  const handleDelete = async (registrationId: string) => {
    try {
      console.log('Deleting registration:', registrationId);
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', registrationId);

      if (error) {
        console.error('Error deleting registration:', error);
        toast({
          variant: "destructive",
          title: "خطأ في حذف المستفيد",
          description: "حدث خطأ أثناء محاولة حذف المستفيد",
        });
        return;
      }

      toast({
        title: "تم حذف المستفيد بنجاح",
      });

      // تحديث البيانات
      await queryClient.invalidateQueries({ queryKey: ['registrations'] });
    } catch (error) {
      console.error('Error in delete handler:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف المستفيد",
        description: "حدث خطأ غير متوقع أثناء محاولة حذف المستفيد",
      });
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم التسجيل</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">رقم الجوال</TableHead>
              <TableHead className="text-right">تاريخ التسجيل</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell className="text-right">
                  {formatRegistrationNumber(registration.registration_number)}
                </TableCell>
                <TableCell className="text-right">{registration.name}</TableCell>
                <TableCell className="text-right">{registration.email}</TableCell>
                <TableCell className="text-right">{registration.phone}</TableCell>
                <TableCell className="text-right">
                  {formatDate(registration.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowQRCard(registration)}
                    >
                      <QrCode className="h-4 w-4" />
                      <span className="mr-2">استخراج البطاقة</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(registration.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="mr-2">حذف</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog 
        open={!!selectedRegistration} 
        onOpenChange={() => setSelectedRegistration(null)}
      >
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">بطاقة التسجيل</DialogTitle>
          </DialogHeader>
          
          {selectedRegistration && (
            <ConfirmationCard
              eventTitle={eventTitle}
              registrationId={selectedRegistration.registration_number}
              formData={{
                name: selectedRegistration.name,
                email: selectedRegistration.email,
                phone: selectedRegistration.phone
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};