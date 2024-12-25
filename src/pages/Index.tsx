import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

  const { data: events = [], isError: isEventsError } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        console.log("Fetching events from Supabase...");
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("date", { ascending: true });

        if (error) {
          console.error("Supabase error fetching events:", error);
          throw error;
        }

        console.log("Events fetched successfully, count:", data?.length);
        return data || [];
      } catch (error) {
        console.error("Error in events query:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error("Query error loading events:", error);
        toast.error("حدث خطأ في تحميل الفعاليات");
      }
    }
  });

  const { data: registrations = {}, isError: isRegistrationsError } = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      try {
        console.log("Fetching registrations from Supabase...");
        const { data, error } = await supabase
          .from("registrations")
          .select("event_id");

        if (error) {
          console.error("Supabase error fetching registrations:", error);
          throw error;
        }

        console.log("Registrations fetched successfully, count:", data?.length);
        
        return (data || []).reduce((acc: { [key: string]: number }, registration) => {
          if (registration.event_id) {
            acc[registration.event_id] = (acc[registration.event_id] || 0) + 1;
          }
          return acc;
        }, {});
      } catch (error) {
        console.error("Error in registrations query:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) => {
        console.error("Query error loading registrations:", error);
        toast.error("حدث خطأ في تحميل التسجيلات");
      }
    }
  });

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
    console.log("Current state:", {
      eventsCount: events.length,
      registrationsCount: Object.keys(registrations).length,
      upcomingEventsCount: upcomingEvents.length,
      pastEventsCount: pastEvents.length,
      isEventsError,
      isRegistrationsError
    });
  }, [events, registrations, upcomingEvents, pastEvents, isEventsError, isRegistrationsError]);

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