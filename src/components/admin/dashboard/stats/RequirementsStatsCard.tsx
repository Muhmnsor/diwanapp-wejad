import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RequirementsStatsCardProps {
  projectId: string;
}

export const RequirementsStatsCard = ({ projectId }: RequirementsStatsCardProps) => {
  const { data: stats } = useQuery({
    queryKey: ['project-requirements', projectId],
    queryFn: async () => {
      // Get project requirements
      const { data: project } = await supabase
        .from('projects')
        .select('required_activities_count, required_attendance_percentage')
        .eq('id', projectId)
        .single();

      if (!project) return { meetRequirements: 0, total: 0, percentage: 0 };

      // Get registrations
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .eq('project_id', projectId);

      if (!registrations?.length) return { meetRequirements: 0, total: 0, percentage: 0 };

      // For each registration, check attendance records
      const { data: attendanceRecords } = await supabase
        .from('attendance_records')
        .select('registration_id, status')
        .eq('project_id', projectId)
        .eq('status', 'present');

      // Count how many registrations meet the requirements
      const registrationAttendance = attendanceRecords?.reduce((acc: any, record) => {
        acc[record.registration_id] = (acc[record.registration_id] || 0) + 1;
        return acc;
      }, {});

      const meetRequirements = Object.values(registrationAttendance || {}).filter(
        (count: any) => count >= project.required_activities_count
      ).length;

      return {
        meetRequirements,
        total: registrations.length,
        percentage: Math.round((meetRequirements / registrations.length) * 100)
      };
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">استيفاء المتطلبات</CardTitle>
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats?.percentage || 0}%</div>
        <p className="text-xs text-muted-foreground">
          {stats?.meetRequirements || 0} من {stats?.total || 0} مشارك
        </p>
      </CardContent>
    </Card>
  );
};