import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { EventConfirmationCard } from "./EventConfirmationCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch registration fields configuration for project
  const { data: registrationFields } = useQuery({
    queryKey: ['project-registration-fields', registrationId],
    queryFn: async () => {
      console.log('Fetching project registration fields for:', registrationId);
      const { data, error } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', registrationId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project registration fields:', error);
        return null;
      }

      console.log('Fetched project registration fields:', data);
      return data || {
        arabic_name: true,
        email: true,
        phone: true
      };
    }
  });

  useEffect(() => {
    console.log('ProjectActivityConfirmationDialog - Component mounted with props:', {
      open,
      registrationId,
      formData,
      registrationFields
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
      formData,
      registrationFields
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

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleCloseDialog}
    >
      <DialogContent 
        className="max-w-md mx-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-center">تم التسجيل بنجاح!</DialogTitle>
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <div>سيتم التواصل معك قريباً</div>
            <div className="font-medium">يرجى حفظ هذا التأكيد أو تصويره قبل الإغلاق</div>
          </div>
        </DialogHeader>
        
        <EventConfirmationCard
          eventTitle={projectTitle || eventTitle}
          registrationId={registrationId}
          registrantInfo={formData}
          eventDetails={{
            date: eventDate,
            time: eventTime,
            location: eventLocation
          }}
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
