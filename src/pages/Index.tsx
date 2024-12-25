import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        return;
      }

      if (data) {
        const now = new Date();
        const upcoming = data.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= now;
        });
        const past = data.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate < now;
        });

        setEvents(data);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      }
    } catch (error) {
      console.error("Error in fetchEvents:", error);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4">
        <Hero />
        <EventsTabs
          events={events}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </main>
    </div>
  );
};

export default Index;