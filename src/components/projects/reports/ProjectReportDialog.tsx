import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectReportForm } from "./ProjectReportForm";
import { ProjectActivity } from "@/types/activity";

interface ProjectReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  activityId: string;
  projectTitle: string;
  activities: ProjectActivity[];
}

export const ProjectReportDialog = ({
  open,
  onOpenChange,
  projectId,
  activityId,
  projectTitle,
  activities,
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
          projectTitle={projectTitle}
          activities={activities}
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};