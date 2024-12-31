import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectConfirmationHeader } from "../../projects/confirmation/ProjectConfirmationHeader";
import { ProjectConfirmationCard } from "../../projects/confirmation/ProjectConfirmationCard";
import { ProjectConfirmationActions } from "../../projects/confirmation/ProjectConfirmationActions";

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
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

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
      isClosing,
      open,
      formData,
      registrationFields
    });
    
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

        <ProjectConfirmationActions onClose={handleCloseDialog} />
      </DialogContent>
    </Dialog>
  );
};
