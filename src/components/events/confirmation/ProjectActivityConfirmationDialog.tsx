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

  // First fetch the registration to get the project_id
  const { data: registration } = useQuery({
    queryKey: ['registration', registrationId],
    queryFn: async () => {
      console.log('Fetching registration:', registrationId);
      const { data, error } = await supabase
        .from('registrations')
        .select('project_id')
        .eq('registration_number', registrationId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching registration:', error);
        return null;
      }

      console.log('Fetched registration:', data);
      return data;
    },
  });

  // Then fetch the registration fields using the project_id
  const { data: registrationFields } = useQuery({
    queryKey: ['project-registration-fields', registration?.project_id],
    queryFn: async () => {
      if (!registration?.project_id) {
        console.log('No project_id available yet');
        return null;
      }

      console.log('Fetching project registration fields for project:', registration.project_id);
      const { data, error } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', registration.project_id)
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
    },
    enabled: !!registration?.project_id,
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