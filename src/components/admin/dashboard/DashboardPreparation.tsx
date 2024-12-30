import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, UserCheck, QrCode } from "lucide-react";

interface DashboardPreparationProps {
  eventId: string;
}

export const DashboardPreparation = ({ eventId }: DashboardPreparationProps) => {
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['registrations-preparation', eventId],
    queryFn: async () => {
      console.log('Fetching registrations for preparation:', eventId);
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      console.log('Fetched registrations:', data);
      return data || [];
    },
  });

  const handleAttendance = async (registrationId: string, status: 'present' | 'absent') => {
    try {
      console.log('Recording attendance:', { registrationId, status });
      
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          registration_id: registrationId,
          event_id: eventId,
          status,
          check_in_time: status === 'present' ? new Date().toISOString() : null,
        })
        .select();

      if (error) throw error;

      console.log('Attendance recorded:', data);
      // Refresh the data
      // Note: In a production app, we would update the cache instead of refetching
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1A1F2C]">تحضير المشاركين</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 ml-2" />
            تحضير بالباركود
          </Button>
          <Button variant="outline" size="sm">
            <UserCheck className="h-4 w-4 ml-2" />
            تحضير جماعي
          </Button>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">رقم الجوال</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">رقم التسجيل</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration: any) => (
              <TableRow key={registration.id}>
                <TableCell>{registration.name}</TableCell>
                <TableCell>{registration.phone}</TableCell>
                <TableCell>{registration.email}</TableCell>
                <TableCell>{registration.registration_number}</TableCell>
                <TableCell>
                  {registration.attendance_records?.[0]?.status === 'present' ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      حاضر
                    </span>
                  ) : registration.attendance_records?.[0]?.status === 'absent' ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      غائب
                    </span>
                  ) : (
                    <span className="text-gray-500">لم يتم التحضير</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => handleAttendance(registration.id, 'present')}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleAttendance(registration.id, 'absent')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};