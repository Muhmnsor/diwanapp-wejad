import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { ReportForm } from "./ReportForm";

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ProjectActivityReport;
}

export const EditReportDialog = ({
  open,
  onOpenChange,
  report,
}: EditReportDialogProps) => {
  console.log("EditReportDialog - report:", report);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل التقرير</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ReportForm
            projectId={report.project_id || ''}
            activityId={report.activity_id || ''}
            initialData={report}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};