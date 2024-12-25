import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

  const fetchEvents = async () => {
    console.log("Fetching events...");
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        throw error;
      }

      console.log("Events fetched successfully:", data);
      return data || [];
    } catch (error) {
      console.error("Error in fetchEvents:", error);
      throw error;
    }
  };

  const fetchRegistrations = async () => {
    console.log("Fetching registrations...");
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("event_id");

      if (error) {
        console.error("Error fetching registrations:", error);
        throw error;
      }

      console.log("Registrations fetched successfully:", data);
      const registrationCounts = (data || []).reduce((acc: { [key: string]: number }, registration) => {
        if (registration.event_id) {
          acc[registration.event_id] = (acc[registration.event_id] || 0) + 1;
        }
        return acc;
      }, {});

      return registrationCounts;
    } catch (error) {
      console.error("Error in fetchRegistrations:", error);
      throw error;
    }
  };

  const { data: events = [], isError: isEventsError, refetch: refetchEvents } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    retry: 2,
    retryDelay: 1000
  });

  const { 
    data: registrations = {}, 
    isError: isRegistrationsError,
    refetch: refetchRegistrations 
  } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrations,
    retry: 2,
    retryDelay: 1000
  });

  useEffect(() => {
    if (isEventsError) {
      console.error("Error loading events");
      toast.error("حدث خطأ في تحميل الفعاليات");
      // Retry loading events after a delay
      setTimeout(() => {
        refetchEvents();
      }, 2000);
    }
    if (isRegistrationsError) {
      console.error("Error loading registrations");
      toast.error("حدث خطأ في تحميل التسجيلات");
      // Retry loading registrations after a delay
      setTimeout(() => {
        refetchRegistrations();
      }, 2000);
    }
  }, [isEventsError, isRegistrationsError, refetchEvents, refetchRegistrations]);

  const now = new Date();
  const upcomingEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  });

  const pastEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate < now;
  });

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