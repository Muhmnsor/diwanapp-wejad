import { EventConfirmationCard } from "../../confirmation/EventConfirmationCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProjectActivityConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  projectTitle?: string; // Added this prop
}

export const ProjectActivityConfirmation = ({
  open,
  onOpenChange,
  registrationId,
  eventTitle,
  formData,
  projectTitle, // Added this prop
}: ProjectActivityConfirmationProps) => {
  console.log('ProjectActivityConfirmation - Rendering with:', {
    registrationId,
    eventTitle,
    formData,
    projectTitle,
    open
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <div className="space-y-4">
          <EventConfirmationCard
            eventTitle={projectTitle || eventTitle}
            registrationId={registrationId}
            registrantInfo={formData}
          />
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4 mr-2" />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};