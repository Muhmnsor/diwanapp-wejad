import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { Table, TableBody } from "@/components/ui/table";
import { toast } from "sonner";
import { ReportTableHeader } from "./table/ReportTableHeader";
import { ReportTableRow } from "./table/ReportTableRow";

interface ProjectReportsListProps {
  projectId: string;
  activityId: string;
}

export const ProjectReportsList = ({
  projectId,
  activityId
}: ProjectReportsListProps) => {
  const { data: reports = [], refetch } = useQuery({
    queryKey: ['project-activity-reports', projectId, activityId],
    queryFn: async () => {
      console.log('Fetching reports for activity:', activityId);
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
      return data as ProjectActivityReport[];
    }
  });

  const handleDelete = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('تم حذف التقرير بنجاح');
      refetch();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    }
  };

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
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};