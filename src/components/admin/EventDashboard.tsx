import { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Event } from "@/store/eventStore";

interface EventDashboardProps {
  eventId: string;
  isProject?: boolean;
  onEditEvent?: (event: Event) => void;
}

export const EventDashboard = ({ 
  eventId, 
  isProject = false,
  onEditEvent
}: EventDashboardProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Fetch events logic here
        // Example: const response = await fetch(`/api/events/${eventId}`);
        // const data = await response.json();
        // setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("حدث خطأ أثناء تحميل الفعاليات");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventId]);

  const handleEditEvent = (event: Event) => {
    if (isProject && onEditEvent) {
      onEditEvent(event);
    } else {
      // Handle regular event editing
      // Example: setSelectedEvent(event);
      // setIsEditDialogOpen(true);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">فعاليات</h2>
      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => (
          <EventCard 
            key={event.id}
            id={event.id || ''}  // Ensure id is always provided
            title={event.title}
            date={event.date}
            location={event.location}
            image_url={event.image_url || ''}
            event_type={event.event_type}
            price={event.price}
            max_attendees={event.max_attendees}
            registration_start_date={event.registration_start_date}
            registration_end_date={event.registration_end_date}
            beneficiary_type={event.beneficiary_type}
            certificate_type={event.certificate_type}
            event_hours={event.event_hours}
            is_visible={event.is_visible}
            onEdit={() => handleEditEvent(event)} 
          />
        ))}
      </div>
      <Button onClick={() => {/* Logic to add new event */}}>إضافة فعالية جديدة</Button>
    </div>
  );
};