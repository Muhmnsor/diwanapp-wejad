import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>تعديل التقرير</DialogTitle>
          <DialogDescription>
            قم بتعديل تفاصيل التقرير
          </DialogDescription>
        </DialogHeader>
        <ReportForm
          projectId={report.project_id || ''}
          activityId={report.activity_id || ''}
          initialData={report}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};