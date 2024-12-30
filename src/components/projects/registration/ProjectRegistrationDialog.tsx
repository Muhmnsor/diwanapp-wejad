import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectRegistrationForm } from "./ProjectRegistrationForm";

interface ProjectRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  maxAttendees: number;
}

export const ProjectRegistrationDialog = ({
  isOpen,
  onClose,
  projectId,
  maxAttendees,
}: ProjectRegistrationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-right">التسجيل في المشروع</DialogTitle>
        </DialogHeader>
        <ProjectRegistrationForm
          projectId={projectId}
          maxAttendees={maxAttendees}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};