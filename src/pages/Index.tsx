import { Banner } from "@/components/home/Banner";
import { EventsSection } from "@/components/events/EventsSection";
import { useEvents } from "@/hooks/useEvents";

export default function Index() {
  const { data: events, isLoading } = useEvents();

  // تقسيم الفعاليات إلى قادمة وسابقة
  const currentDate = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.date) >= currentDate) || [];
  const pastEvents = events?.filter(event => new Date(event.date) < currentDate) || [];

  return (
    <div className="min-h-screen space-y-16 pb-16">
      <Banner />
      
      <div className="container mx-auto px-4 space-y-16">
        <EventsSection 
          title="الفعاليات القادمة" 
          events={upcomingEvents}
          registrations={{}}
        />

        <EventsSection 
          title="الفعاليات السابقة" 
          events={pastEvents}
          registrations={{}}
          isPastEvents
        />
      </div>
    </div>
  );
}