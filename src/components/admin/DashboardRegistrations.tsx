import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationsTable } from "./RegistrationsTable";
import { Card } from "@/components/ui/card";
import { AttendanceStats } from "./attendance/AttendanceStats";
import { ExportButton } from "./ExportButton";

interface DashboardRegistrationsProps {
  eventId: string;
}

export const DashboardRegistrations = ({ eventId }: DashboardRegistrationsProps) => {
  console.log("DashboardRegistrations - eventId:", eventId);

  const { data: registrations = [], refetch: refetchRegistrations } = useQuery({
    queryKey: ['event-registrations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          attendance_records(*)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    },
  });

  const prepareExportData = () => {
    return registrations.map(reg => ({
      'الاسم': reg.name,
      'البريد الإلكتروني': reg.email,
      'رقم الجوال': reg.phone,
      'رقم التسجيل': reg.registration_number,
      'الحضور': reg.attendance_records?.some((record: any) => record.status === 'present') ? 'حاضر' : 'غائب'
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <AttendanceStats registrations={registrations} />
        <ExportButton 
          data={prepareExportData()} 
          filename="registrations"
        />
      </div>
      <Card>
        <RegistrationsTable 
          registrations={registrations} 
          eventId={eventId}
          onAttendanceChange={refetchRegistrations}
        />
      </Card>
    </div>
  );
};