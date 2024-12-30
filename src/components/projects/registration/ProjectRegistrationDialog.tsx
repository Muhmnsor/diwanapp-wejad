import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectFormContainer } from "./form/ProjectFormContainer";

interface ProjectRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  eventType: string;
}

export const ProjectRegistrationDialog = ({
  open,
  onOpenChange,
  projectTitle,
  projectPrice,
  startDate,
  endDate,
  eventType,
}: ProjectRegistrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">التسجيل في المشروع</DialogTitle>
        </DialogHeader>
        <ProjectFormContainer
          projectTitle={projectTitle}
          projectPrice={projectPrice}
          startDate={startDate}
          endDate={endDate}
          eventType={eventType}
          onSubmit={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};