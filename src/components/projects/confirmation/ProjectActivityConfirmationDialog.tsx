
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ProjectConfirmationHeader } from "./ProjectConfirmationHeader";
import { ProjectConfirmationCard } from "./ProjectConfirmationCard";
import { ProjectConfirmationActions } from "../../projects/registration/form/ProjectRegistrationActions";

interface ProjectActivityConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  projectTitle?: string;
}

export const ProjectActivityConfirmationDialog = ({
  open,
  onOpenChange,
  registrationId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  formData,
  projectTitle,
}: ProjectActivityConfirmationDialogProps) => {
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    console.log('handleClose called');
    setIsClosing(true);
    onOpenChange(false);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleClose}
    >
      <DialogContent 
        className="max-w-md mx-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <ProjectConfirmationHeader />
        
        <ProjectConfirmationCard
          eventTitle={eventTitle}
          projectTitle={projectTitle}
          registrationId={registrationId}
          formData={formData}
          eventDetails={{
            date: eventDate,
            time: eventTime,
            location: eventLocation
          }}
        />

        <ProjectConfirmationActions 
          onClose={handleClose}
          hasDownloaded={hasDownloaded}
          setHasDownloaded={setHasDownloaded}
          projectTitle={projectTitle || eventTitle}
        />
      </DialogContent>
    </Dialog>
  );
};
