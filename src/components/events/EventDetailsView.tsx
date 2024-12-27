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
    // Add a small delay to ensure proper loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!event && !isLoading) {
      setError("لم يتم العثور على الفعالية");
      console.error("Event data is missing:", { id, event });
    }
  }, [event, isLoading, id]);

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      console.log('Starting registration process for event:', event?.title);
      
      navigate(`/events/${id}/register`);
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error("حدث خطأ أثناء التسجيل");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = async () => {
    if (!event) {
      console.error("Cannot share event: No event data");
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
      console.error('Error sharing:', error);
      toast.error("حدث خطأ أثناء المشاركة");
    }
  };

  if (isLoading) {
    return <EventLoadingState />;
  }

  if (error || !event) {
    return <EventNotFound message={error || "لم يتم العثور على الفعالية"} />;
  }

  console.log('Rendering EventDetailsView with data:', {
    title: event.title,
    imageUrl: event.image_url || event.imageUrl,
    isAdmin,
    eventData: event
  });

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