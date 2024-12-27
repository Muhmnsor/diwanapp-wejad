import { useEffect, useState } from "react";
import { Event } from "@/store/eventStore";
import { EventContent } from "./EventContent";
import { EventHeader } from "./EventHeader";
import { EventActions } from "./EventActions";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventDetailsViewProps {
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  id: string;
}

export const EventDetailsView = ({ 
  event, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onAddToCalendar,
  id 
}: EventDetailsViewProps) => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      console.log('Starting registration process for event:', event.title);
      
      navigate(`/events/${id}/register`);
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="container mx-auto px-4 space-y-6 max-w-4xl">
      <EventHeader 
        title={event.title}
        imageUrl={event.image_url || event.imageUrl}
      />
      
      <EventActions 
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddToCalendar={onAddToCalendar}
      />
      
      <EventContent 
        event={event}
        onRegister={handleRegister}
      />
    </div>
  );
};