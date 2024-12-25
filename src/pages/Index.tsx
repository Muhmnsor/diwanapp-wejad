import { useEffect, useState } from "react";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";
import { useEvents } from "@/hooks/useEvents";
import { useRegistrations } from "@/hooks/useRegistrations";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");
  
  const { 
    data: events = [], 
    isError: isEventsError,
    error: eventsError 
  } = useEvents();
  
  const { 
    data: registrations = {}, 
    isError: isRegistrationsError,
    error: registrationsError 
  } = useRegistrations();

  const now = new Date();
  const upcomingEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });

  const pastEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate < now;
  });

  useEffect(() => {
    console.log("📊 حالة البيانات:", {
      eventsCount: events.length,
      registrationsCount: Object.keys(registrations).length,
      upcomingEventsCount: upcomingEvents.length,
      pastEventsCount: pastEvents.length,
      isEventsError,
      isRegistrationsError
    });

    if (isEventsError) {
      console.error("❌ خطأ في جلب الفعاليات:", eventsError);
    }

    if (isRegistrationsError) {
      console.error("❌ خطأ في جلب التسجيلات:", registrationsError);
    }
  }, [
    events, 
    registrations, 
    upcomingEvents, 
    pastEvents, 
    isEventsError,
    isRegistrationsError,
    eventsError,
    registrationsError
  ]);

  return (
    <div className="min-h-screen">
      <Hero />
      <EventsTabs
        events={events}
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        registrations={registrations}
      />
    </div>
  );
};

export default Index;