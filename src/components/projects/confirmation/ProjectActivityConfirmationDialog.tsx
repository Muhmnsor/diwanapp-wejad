import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EventConfirmationCard } from "../../events/confirmation/EventConfirmationCard";

interface ProjectActivityConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
}

export const ProjectActivityConfirmationDialog = ({
  open,
  onOpenChange,
  registrationId,
  eventTitle,
  formData,
}: ProjectActivityConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <div className="space-y-4">
          <EventConfirmationCard
            eventTitle={eventTitle}
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