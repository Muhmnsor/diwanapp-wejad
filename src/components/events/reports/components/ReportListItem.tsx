import { useState } from "react";
import { Report } from "@/types/report";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ReportContent } from "./ReportContent";
import { ReportHeader } from "./ReportHeader";
import { ReportDeleteDialog } from "./ReportDeleteDialog";
import { EditReportDialog } from "./EditReportDialog";

interface ReportListItemProps {
  report: Report;
  eventTitle?: string;
  isProjectActivity?: boolean;
}

export const ReportListItem = ({
  report,
  eventTitle,
  isProjectActivity = false,
}: ReportListItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('Attempting to delete report:', report.id);
      
      const { error } = await supabase
        .from(isProjectActivity ? 'project_activity_reports' : 'event_reports')
        .delete()
        .eq('id', report.id);

      if (error) {
        throw error;
      }

      console.log('Report deleted successfully');
      await queryClient.invalidateQueries({
        queryKey: isProjectActivity 
          ? ['project-activity-reports', report.event_id]
          : ['event-reports', report.event_id]
      });
      toast.success('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="space-y-4 border rounded-lg p-4">
        <ReportHeader
          report={report}
          onEdit={() => setShowEditDialog(true)}
          onDelete={() => setShowDeleteDialog(true)}
        />
        <ReportContent report={report} eventTitle={eventTitle} />
      </div>

      <ReportDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      {showEditDialog && (
        <EditReportDialog
          report={report}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          isProjectActivity={isProjectActivity}
        />
      )}
    </>
  );
};