import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">اسم التقرير</TableHead>
            <TableHead className="text-right">معد التقرير</TableHead>
            <TableHead className="text-right">تاريخ الإضافة</TableHead>
            <TableHead className="text-center">إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="text-right font-medium">
                {report.report_name}
              </TableCell>
              <TableCell className="text-right">
                {report.profiles?.email || 'غير معروف'}
              </TableCell>
              <TableCell className="text-right">
                {new Date(report.created_at).toLocaleDateString('ar')}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(report.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};