import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectFormContainer } from "./form/ProjectFormContainer";
import { Project } from "@/types/project";

interface ProjectRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export const ProjectRegistrationDialog = ({
  open,
  onOpenChange,
  project,
}: ProjectRegistrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">التسجيل في المشروع</DialogTitle>
        </DialogHeader>
        <ProjectFormContainer
          projectTitle={project.title}
          projectPrice={project.price}
          startDate={project.start_date}
          endDate={project.end_date}
          eventType={project.event_type}
          onSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};