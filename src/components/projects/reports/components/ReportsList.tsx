import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody } from "@/components/ui/table";
import { ReportListContainer } from "@/components/events/reports/ReportListContainer";
import { ReportListHeader } from "@/components/events/reports/ReportListHeader";
import { TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { ReportDeleteDialog } from "@/components/events/reports/components/ReportDeleteDialog";
import { downloadReportWithImages } from "@/components/events/reports/utils/downloadUtils";

interface ReportsListProps {
  projectId: string;
  activityId: string;
}

export const ReportsList = ({
  projectId,
  activityId
}: ReportsListProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: reports, isLoading, error } = useQuery({
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
      return data;
    }
  });

  const handleDelete = async () => {
    if (!selectedReport) return;
    
    try {
      setIsDeleting(true);
      console.log('Attempting to delete report:', selectedReport.id);
      
      const { error } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('id', selectedReport.id);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('حدث خطأ أثناء حذف التقرير');
        return;
      }

      console.log('Report deleted successfully');
      await queryClient.invalidateQueries({
        queryKey: ['project-activity-reports', projectId, activityId]
      });
      toast.success('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('Error in delete handler:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedReport(null);
    }
  };

  const handleDownload = async (report: any) => {
    try {
      toast.info('جاري تحضير الملف...');
      const success = await downloadReportWithImages(report);
      if (success) {
        toast.success('تم تحميل التقرير بنجاح');
      } else {
        toast.error('حدث خطأ أثناء تحميل التقرير');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('حدث خطأ أثناء تحميل التقرير');
    }
  };

  const reportRows = reports?.map((report) => (
    <TableRow key={report.id} dir="rtl">
      <td className="text-right px-6 py-4">{report.report_name}</td>
      <td className="text-right px-6 py-4">{report.profiles?.email || 'غير معروف'}</td>
      <td className="text-right px-6 py-4">
        {new Date(report.created_at).toLocaleDateString('ar')}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDownload(report)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedReport(report);
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </TableRow>
  ));

  return (
    <>
      <ReportListContainer 
        isLoading={isLoading} 
        error={error}
      >
        {{
          header: <ReportListHeader title="تقارير النشاط" />,
          rows: reportRows
        }}
      </ReportListContainer>

      <ReportDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
};