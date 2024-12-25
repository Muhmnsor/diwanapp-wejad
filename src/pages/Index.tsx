import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");
  const [registrations, setRegistrations] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("event_id, count")
        .select("event_id");

      if (error) {
        console.error("Error fetching registrations:", error);
        return;
      }

      if (data) {
        const registrationCounts = data.reduce((acc: { [key: string]: number }, registration) => {
          acc[registration.event_id] = (acc[registration.event_id] || 0) + 1;
          return acc;
        }, {});
        setRegistrations(registrationCounts);
      }
    } catch (error) {
      console.error("Error in fetchRegistrations:", error);
    }
  };

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
          registrations={registrations}
        />
      </main>
    </div>
  );
};

export default Index;