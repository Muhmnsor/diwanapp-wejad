import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportTableHeader } from "./table/ReportTableHeader";
import { ReportTableRow } from "./table/ReportTableRow";
import { Card } from "@/components/ui/card";

interface ProjectReportsListProps {
  projectId: string;
  activityId?: string;
}

export const ProjectReportsList = ({ projectId, activityId }: ProjectReportsListProps) => {
  console.log('Fetching project activities for reports:', projectId);
  
  const { data: reports = [], refetch } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      let query = supabase
        .from('project_activity_reports')
        .select(`
          *,
          profiles:executor_id (
            id,
            email
          ),
          events:activity_id (
            title
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (activityId) {
        query = query.eq('activity_id', activityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Fetched reports:', data);
      return data || [];
    },
  });

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      
      await refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="rounded-md border">
        <div className="w-full">
          <ReportTableHeader />
          <div className="divide-y">
            {reports.map((report: any) => (
              <ReportTableRow
                key={report.id}
                report={report}
                onDelete={() => handleDeleteReport(report.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};