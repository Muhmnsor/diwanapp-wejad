import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { Table, TableBody } from "@/components/ui/table";
import { ReportListHeader } from "@/components/events/reports/ReportListHeader";
import { ReportListItem } from "@/components/events/reports/ReportListItem";

interface ProjectActivityReportsListProps {
  projectId: string;
  activityId: string;
}

export const ProjectActivityReportsList = ({
  projectId,
  activityId,
}: ProjectActivityReportsListProps) => {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log("Fetching reports for activity:", activityId);
      const { data, error } = await supabase
        .from('project_activity_reports')
        .select(`
          *,
          profiles:executor_id (
            email
          )
        `)
        .eq('project_id', projectId)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched reports:", data);
      return data as ProjectActivityReport[];
    },
    enabled: !!projectId && !!activityId,
  });

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل التقارير...</div>;
  }

  if (!reports?.length) {
    return <div className="text-center py-4">لا توجد تقارير لهذا النشاط</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">التقارير السابقة</h3>
      <div className="rounded-md border">
        <Table>
          <ReportListHeader title="تقارير النشاط" />
          <TableBody>
            {reports.map((report) => (
              <ReportListItem 
                key={report.id} 
                report={{
                  ...report,
                  profiles: {
                    email: report.profiles?.email || 'غير معروف'
                  }
                }}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};