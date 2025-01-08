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
  console.log('ProjectRegistrationDialog - Project:', project);

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-[500px]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-right">التسجيل في المشروع {project.title}</DialogTitle>
        </DialogHeader>
        <ProjectFormContainer
          projectTitle={project.title}
          projectPrice={project.price}
          startDate={project.start_date}
          endDate={project.end_date}
          onSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};