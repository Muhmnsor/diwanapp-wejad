import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectReportForm } from "./ProjectReportForm";

interface ProjectReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  activityId: string;
}

export const ProjectReportDialog = ({
  open,
  onOpenChange,
  projectId,
  activityId,
}: ProjectReportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>إضافة تقرير جديد</DialogTitle>
        </DialogHeader>
        <ProjectReportForm
          projectId={projectId}
          activityId={activityId}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};