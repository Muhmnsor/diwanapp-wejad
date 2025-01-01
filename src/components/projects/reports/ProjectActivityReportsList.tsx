import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { ReportListHeader } from "@/components/events/reports/ReportListHeader";
import { ReportListItem } from "@/components/events/reports/ReportListItem";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { Report } from "@/types/report";

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
            id,
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
            {reports.map((report) => {
              const mappedReport: Report = {
                id: report.id,
                event_id: report.activity_id,
                report_text: report.report_text,
                photos: report.photos || [],
                created_at: report.created_at,
                report_name: report.report_name,
                program_name: report.program_name,
                detailed_description: report.detailed_description || '',
                event_duration: report.activity_duration || '',
                attendees_count: report.attendees_count || '',
                event_objectives: report.activity_objectives || '',
                impact_on_participants: report.impact_on_participants || '',
                profiles: {
                  id: report.executor_id,
                  email: report.profiles?.email || 'غير معروف'
                },
                video_links: [],
                additional_links: [],
                satisfaction_level: null,
                files: [],
                comments: []
              };
              
              return (
                <ReportListItem 
                  key={report.id} 
                  report={mappedReport}
                  isProjectActivity={true}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};