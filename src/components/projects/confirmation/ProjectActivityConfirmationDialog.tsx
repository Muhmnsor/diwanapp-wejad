import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProjectConfirmationHeader } from "./ProjectConfirmationHeader";
import { ProjectConfirmationActions } from "./ProjectConfirmationActions";
import { useConfirmationValidation } from "./useConfirmationValidation";
import { ConfirmationCard } from "../../events/ConfirmationCard";

interface ProjectActivityConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  eventPrice: number | "free";
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  projectTitle?: string;
  onPayment: () => void;
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
  const [isClosing, setIsClosing] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const navigate = useNavigate();

  const { validateRequiredFields } = useConfirmationValidation(registrationId, formData);

  useEffect(() => {
    console.log('ProjectActivityConfirmationDialog - Component mounted with props:', {
      open,
      registrationId,
      formData
    });
    
    return () => {
      console.log('ProjectActivityConfirmationDialog - Component unmounting');
    };
  }, []);

  const handleCloseDialog = () => {
    console.log('handleCloseDialog called - Current state:', {
      hasDownloaded,
      isClosing,
      open,
      formData
    });
    
    if (!hasDownloaded) {
      console.log('Showing confirmation dialog - Card not downloaded yet');
      const shouldClose = window.confirm("هل أنت متأكد من إغلاق نافذة التأكيد؟ لم تقم بحفظ التأكيد بعد.");
      if (!shouldClose) {
        console.log('Close cancelled by user');
        return;
      }
    }

    console.log('Proceeding with dialog close');
    setIsClosing(true);
    onOpenChange(false);
    
    setTimeout(() => {
      console.log('Navigating to home page');
      navigate('/');
    }, 300);
  };

  const handleDownloadSuccess = () => {
    console.log('Card downloaded successfully');
    setHasDownloaded(true);
    toast.success('تم حفظ بطاقة التأكيد بنجاح');
  };

  if (!validateRequiredFields()) {
    console.log('Project required fields validation failed:', {
      formData
    });
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        console.log('Dialog onOpenChange triggered:', {
          newOpen,
          currentOpen: open,
          isClosing,
          hasDownloaded
        });
        if (!newOpen) {
          handleCloseDialog();
        }
      }}
    >
      <DialogContent 
        className="max-w-md mx-auto"
        onPointerDownOutside={(e) => {
          console.log('Preventing outside click close');
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          console.log('Preventing escape key close');
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          console.log('Preventing interaction outside');
          e.preventDefault();
        }}
      >
        <ProjectConfirmationHeader />
        
        <ConfirmationCard
          eventTitle={eventTitle}
          registrationId={registrationId}
          formData={formData}
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
          isProjectActivity={true}
          projectTitle={projectTitle}
          onSave={handleDownloadSuccess}
        />

        <ProjectConfirmationActions
          onClose={handleCloseDialog}
          hasDownloaded={hasDownloaded}
        />
      </DialogContent>
    </Dialog>
  );
};