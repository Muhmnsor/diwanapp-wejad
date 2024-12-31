import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { ConfirmationCard } from "./ConfirmationCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  eventPrice: number | "free";
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  isProjectActivity?: boolean;
  projectTitle?: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  onPayment: () => void;
}

export const RegistrationConfirmation = ({
  open,
  onOpenChange,
  registrationId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  isProjectActivity,
  projectTitle,
  formData,
}: RegistrationConfirmationProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const navigate = useNavigate();

  // Fetch registration fields configuration
  const { data: registrationFields } = useQuery({
    queryKey: ['registration-fields', registrationId],
    queryFn: async () => {
      console.log('Fetching registration fields for:', registrationId);
      const { data, error } = await supabase
        .from('event_registration_fields')
        .select('*')
        .eq('event_id', registrationId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching registration fields:', error);
        return null;
      }

      console.log('Fetched registration fields:', data);
      return data || {
        arabic_name: true,
        email: true,
        phone: true
      };
    }
  });

  useEffect(() => {
    console.log('RegistrationConfirmation - Component mounted with props:', {
      open,
      registrationId,
      formData,
      registrationFields
    });
    
    return () => {
      console.log('RegistrationConfirmation - Component unmounting');
    };
  }, []);

  useEffect(() => {
    console.log('Dialog open state changed:', open);
    if (!open && !isClosing) {
      console.log('Dialog closed externally');
    }
  }, [open]);

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
    
    // Delay navigation to ensure dialog closes smoothly
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

  // Validate only required fields based on registration fields configuration
  const validateRequiredFields = () => {
    if (!registrationFields) return false;

    const requiredValidations = {
      name: !registrationFields.arabic_name || (registrationFields.arabic_name && formData.name),
      email: !registrationFields.email || (registrationFields.email && formData.email),
      phone: !registrationFields.phone || (registrationFields.phone && formData.phone)
    };

    console.log('Validating required fields:', {
      registrationFields,
      formData,
      validations: requiredValidations
    });

    return Object.values(requiredValidations).every(isValid => isValid);
  };

  // Return null if required fields are not valid
  if (!validateRequiredFields()) {
    console.log('Required fields validation failed:', {
      formData,
      registrationFields
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
          isProjectActivity={isProjectActivity}
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