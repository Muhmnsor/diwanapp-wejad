import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { toast } from "sonner";
import { ReportTableHeader } from "./table/ReportTableHeader";
import { ReportTableRow } from "./table/ReportTableRow";

interface ProjectReportsListProps {
  projectId: string;
  activityId?: string;
}

export const ProjectReportsList = ({
  projectId,
  activityId
}: ProjectReportsListProps) => {
  const { data: reports = [], refetch } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log('Fetching reports with params:', { projectId, activityId });
      
      let query = supabase
        .from('project_activity_reports')
        .select(`
          *,
          profiles:executor_id (
            id,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Only add activity_id filter if it's provided and valid
      if (activityId) {
        query = query.eq('activity_id', activityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reports:', error);
        toast.error('حدث خطأ أثناء جلب التقارير');
        return [];
      }

      console.log('Fetched reports:', data);
      return data;
    },
    enabled: !!projectId // Only run query if projectId is provided
  });

  if (!reports.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا يوجد تقارير لهذا النشاط
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <ReportTableHeader />
        <TableBody>
          {reports.map((report) => (
            <ReportTableRow
              key={report.id}
              report={report}
              onDelete={refetch}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};