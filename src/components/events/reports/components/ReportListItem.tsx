import { TableRow } from "@/components/ui/table";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { downloadReportWithImages } from "../utils/downloadUtils";
import { ReportDeleteDialog } from "./ReportDeleteDialog";
import { ReportListItemContent } from "./ReportListItemContent";
import { ReportListItemActions } from "./ReportListItemActions";
import { Report } from "@/types/report";

interface ReportListItemProps {
  report: Report;
  eventTitle?: string;
}

export const ReportListItem = ({
  report,
  eventTitle,
}: ReportListItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('Attempting to delete report:', report.id);
      
      const { error } = await supabase
        .from('event_reports')
        .delete()
        .eq('id', report.id);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('حدث خطأ أثناء حذف التقرير');
        return;
      }

      console.log('Report deleted successfully');
      await queryClient.invalidateQueries({
        queryKey: ['event-reports', report.event_id]
      });
      toast.success('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('Error in delete handler:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownload = async () => {
    try {
      toast.info('جاري تحضير الملف...');
      const success = await downloadReportWithImages(report, eventTitle);
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

  return (
    <>
      <TableRow dir="rtl">
        <ReportListItemContent
          reportName={report.report_name || eventTitle || ''}
          authorEmail={report.profiles?.email || 'غير معروف'}
          createdAt={report.created_at}
        />
        <ReportListItemActions
          report={report}
          onDownload={handleDownload}
          onDelete={() => setShowDeleteDialog(true)}
          isDeleting={isDeleting}
        />
      </TableRow>
      
      <ReportDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
};