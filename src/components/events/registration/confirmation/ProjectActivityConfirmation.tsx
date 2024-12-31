import { ConfirmationCard } from "../../ConfirmationCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useConfirmationValidation } from "@/components/projects/confirmation/useConfirmationValidation";

interface ProjectActivityConfirmationProps {
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

export const ProjectActivityConfirmation = ({
  open,
  onOpenChange,
  registrationId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  formData,
  projectTitle,
}: ProjectActivityConfirmationProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const navigate = useNavigate();

  const { validateRequiredFields } = useConfirmationValidation(registrationId, formData);

  console.log('ProjectActivityConfirmation - Rendering with:', {
    registrationId,
    eventTitle,
    formData,
    projectTitle
  });

  const handleCloseDialog = () => {
    console.log('handleCloseDialog called - Current state:', {
      hasDownloaded,
      isClosing
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
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-center">تم التسجيل بنجاح!</DialogTitle>
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <div>سيتم التواصل معك قريباً</div>
            <div className="font-medium">يرجى حفظ هذا التأكيد أو تصويره قبل الإغلاق</div>
          </div>
        </DialogHeader>
        
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

        <Button 
          variant="outline" 
          className="w-full mt-2"
          onClick={handleCloseDialog}
        >
          <X className="w-4 h-4 mr-2" />
          إغلاق
        </Button>
      </DialogContent>
    </Dialog>
  );
};