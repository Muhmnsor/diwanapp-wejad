import { DashboardStats } from "./DashboardStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface DashboardOverviewProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  eventDate: string;
  eventTime: string;
  eventPath?: string;
  eventCategory?: string;
  projectId?: string;
}

interface RegistrantStats {
  name: string;
  email: string;
  phone: string;
  attendedActivities: number;
  totalActivities: number;
  attendancePercentage: number;
}

export const DashboardOverview = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  eventDate,
  eventTime,
  eventPath,
  eventCategory,
  projectId
}: DashboardOverviewProps) => {
  console.log("DashboardOverview props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    eventDate,
    eventTime,
    eventPath,
    eventCategory,
    projectId
  });

  const { data: registrantsStats = [], isLoading } = useQuery({
    queryKey: ['registrants-stats', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // Get all registrations for this project
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          name,
          email,
          phone,
          attendance_records(*)
        `)
        .eq('project_id', projectId);

      if (regError) {
        console.error('Error fetching registrations:', regError);
        throw regError;
      }

      // Get total number of activities for this project
      const { data: activities, error: actError } = await supabase
        .from('events')
        .select('id')
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (actError) {
        console.error('Error fetching activities:', actError);
        throw actError;
      }

      const totalActivities = activities?.length || 0;

      // Calculate stats for each registrant
      return registrations.map((reg: any): RegistrantStats => {
        const attendedActivities = reg.attendance_records?.filter(
          (record: any) => record.status === 'present'
        ).length || 0;

        return {
          name: reg.name,
          email: reg.email,
          phone: reg.phone,
          attendedActivities,
          totalActivities,
          attendancePercentage: totalActivities > 0 
            ? (attendedActivities / totalActivities) * 100 
            : 0
        };
      });
    },
    enabled: !!projectId
  });

  return (
    <div className="space-y-8">
      <DashboardStats
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
        eventDate={eventDate}
        eventTime={eventTime}
        eventPath={eventPath}
        eventCategory={eventCategory}
      />

      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4 text-right">قائمة المسجلين وإحصائيات الحضور</h3>
        
        {isLoading ? (
          <div className="text-center py-4">جاري التحميل...</div>
        ) : (
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">رقم الجوال</TableHead>
                <TableHead className="text-right">الأنشطة المحضورة</TableHead>
                <TableHead className="text-right">نسبة الحضور</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrantsStats.map((registrant: RegistrantStats) => (
                <TableRow key={registrant.email}>
                  <TableCell>{registrant.name}</TableCell>
                  <TableCell>{registrant.email}</TableCell>
                  <TableCell>{registrant.phone}</TableCell>
                  <TableCell>
                    {registrant.attendedActivities} من {registrant.totalActivities}
                  </TableCell>
                  <TableCell className="w-[200px]">
                    <div className="flex items-center gap-2">
                      <Progress value={registrant.attendancePercentage} className="h-2" />
                      <span className="text-sm text-gray-500">
                        {Math.round(registrant.attendancePercentage)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};