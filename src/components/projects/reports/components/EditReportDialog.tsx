import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { ProjectActivityReportForm } from "../ProjectActivityReportForm";

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
        </DialogHeader>
        <ProjectActivityReportForm
          projectId={report.project_id}
          activityId={report.activity_id}
          onSuccess={() => onOpenChange(false)}
          initialData={report}
        />
      </DialogContent>
    </Dialog>
  );
};