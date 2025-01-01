import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectActivityReportFormContainer } from "./ProjectActivityReportFormContainer";

interface ProjectActivityReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  activityId: string;
}

export const ProjectActivityReportDialog = ({
  open,
  onOpenChange,
  projectId,
  activityId,
}: ProjectActivityReportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة تقرير النشاط</DialogTitle>
        </DialogHeader>
        <ProjectActivityReportFormContainer 
          projectId={projectId} 
          activityId={activityId}
          onSuccess={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};