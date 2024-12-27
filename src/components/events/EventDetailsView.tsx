import { useState, useEffect } from "react";
import { Event } from "@/store/eventStore";
import { EventContent } from "./EventContent";
import { EventHeader } from "./EventHeader";
import { EventActions } from "./EventActions";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EventLoadingState } from "./EventLoadingState";
import { EventNotFound } from "./EventNotFound";
import { supabase } from "@/integrations/supabase/client";

interface EventDetailsViewProps {
  event: Event | null;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  id: string;
}

const EventDetailsView = ({ 
  event: initialEvent, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onAddToCalendar,
  id 
}: EventDetailsViewProps) => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(initialEvent);
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        console.log('Fetching event details for ID:', id);
        
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (eventError) {
          console.error('Error fetching event:', eventError);
          setError("حدث خطأ في جلب بيانات الفعالية");
          setIsLoading(false);
          return;
        }

        if (!eventData) {
          console.log('No event found with ID:', id);
          setError("لم يتم العثور على الفعالية");
          setIsLoading(false);
          return;
        }

        // Fetch registration count
        const { count: registrationsCount, error: registrationsError } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', id);

        if (registrationsError) {
          console.error('Error fetching registrations count:', registrationsError);
        } else {
          console.log('Registrations count:', registrationsCount);
          setRegistrationCount(registrationsCount || 0);
        }

        // Update event with registration count
        const eventWithAttendees = {
          ...eventData,
          attendees: registrationsCount || 0
        };

        console.log('Setting event data:', eventWithAttendees);
        setEvent(eventWithAttendees);
        setIsLoading(false);
        setError(null);

      } catch (error) {
        console.error('Unexpected error:', error);
        setError("حدث خطأ غير متوقع");
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchEventDetails();
  }, [id]);

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      console.log('Starting registration for event:', {
        eventId: id,
        eventTitle: event?.title
      });
      
      navigate(`/events/${id}/register`);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = async () => {
    if (!event) {
      console.error("Share failed: No event data");
      toast.error("حدث خطأ أثناء المشاركة");
      return;
    }

    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Share error:', error);
      toast.error("حدث خطأ أثناء المشاركة");
    }
  };

  if (isLoading) {
    return <EventLoadingState />;
  }

  if (error || !event) {
    console.log('Showing error state:', { error });
    return <EventNotFound message={error || "لم يتم العثور على الفعالية"} />;
  }

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
        eventTitle={event.title}
        eventDescription={event.description}
        onShare={handleShare}
      />
      
      <EventContent 
        event={event}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default EventDetailsView;