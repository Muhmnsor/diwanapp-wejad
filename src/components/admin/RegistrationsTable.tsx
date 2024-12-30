import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegistrationsTableProps {
  registrations: any[];
  eventId: string;
  onAttendanceChange: () => void;
}

export const RegistrationsTable = ({ 
  registrations,
  eventId,
  onAttendanceChange
}: RegistrationsTableProps) => {
  const handleAttendance = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          event_id: eventId,
          registration_id: registrationId,
          status,
          check_in_time: new Date().toISOString(),
        }, {
          onConflict: 'registration_id,event_id'
        });

      if (error) throw error;

      toast.success(status === 'present' ? 'تم تسجيل الحضور بنجاح' : 'تم تسجيل الغياب بنجاح');
      onAttendanceChange();
    } catch (error) {
      console.error('Error recording attendance:', error);
      toast.error('حدث خطأ أثناء تسجيل الحضور');
    }
  };

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الاسم</TableHead>
            <TableHead>البريد الإلكتروني</TableHead>
            <TableHead>رقم الجوال</TableHead>
            <TableHead>رقم التسجيل</TableHead>
            <TableHead>الحضور</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell>{registration.name}</TableCell>
              <TableCell>{registration.email}</TableCell>
              <TableCell>{registration.phone}</TableCell>
              <TableCell>{registration.registration_number}</TableCell>
              <TableCell>
                {registration.attendance_records?.some((record: any) => record.status === 'present')
                  ? <span className="text-green-500">حاضر</span>
                  : <span className="text-red-500">غائب</span>
                }
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAttendance(registration.id, 'present')}
                    className="h-8 w-8 text-green-500"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAttendance(registration.id, 'absent')}
                    className="h-8 w-8 text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};