import { useState, useEffect } from "react";
import { Event } from "@/store/eventStore";
import { EventContent } from "./EventContent";
import { EventHeader } from "./EventHeader";
import { EventActions } from "./EventActions";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { EventLoadingState } from "./EventLoadingState";
import { EventNotFound } from "./EventNotFound";

interface EventDetailsViewProps {
  event: Event | null;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  id: string;
}

const EventDetailsView = ({ 
  event, 
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

  useEffect(() => {
    console.log('EventDetailsView - Initial mount with event:', {
      eventId: id,
      eventData: event,
      isAdmin
    });

    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('EventDetailsView - Loading state completed');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!event) {
        console.error('EventDetailsView - Event data missing:', { id });
        setError("لم يتم العثور على الفعالية");
      } else {
        console.log('EventDetailsView - Event data loaded successfully:', {
          id: event.id,
          title: event.title,
          isAdmin
        });
      }
    }
  }, [event, isLoading, id]);

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      console.log('EventDetailsView - Starting registration:', {
        eventId: id,
        eventTitle: event?.title
      });
      
      navigate(`/events/${id}/register`);
    } catch (error) {
      console.error('EventDetailsView - Registration error:', error);
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = async () => {
    if (!event) {
      console.error("EventDetailsView - Share failed: No event data");
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
      console.error('EventDetailsView - Share error:', error);
      toast.error("حدث خطأ أثناء المشاركة");
    }
  };

  if (isLoading) {
    return <EventLoadingState />;
  }

  if (error || !event) {
    console.log('EventDetailsView - Showing error state:', { error });
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