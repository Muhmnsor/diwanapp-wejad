import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportListContainer } from "@/components/events/reports/ReportListContainer";
import { ReportListHeader } from "@/components/events/reports/ReportListHeader";
import { ReportListItem } from "@/components/events/reports/ReportListItem";

interface ProjectReportsListProps {
  projectId: string;
  activityId: string;
}

export const ProjectReportsList = ({
  projectId,
  activityId
}: ProjectReportsListProps) => {
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log('Fetching reports for project:', projectId, 'and activity:', activityId);
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

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Reports fetched:', data);
      return data;
    },
  });

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['project-activity-reports', projectId, activityId]
    });
  };

  const reportRows = reports?.map((report) => (
    <ReportListItem 
      key={report.id} 
      report={report}
      onSuccess={handleSuccess}
    />
  ));

  return (
    <ReportListContainer 
      isLoading={isLoading} 
      error={error}
    >
      {{
        header: <ReportListHeader title="تقارير النشاط" />,
        rows: reportRows
      }}
    </ReportListContainer>
  );
};