import { Navigation } from "@/components/Navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventsSection } from "@/components/events/EventsSection";
import { Footer } from "@/components/layout/Footer";

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Fetch initial events
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      console.log('Fetched events:', data);
      setEvents(data || []);
    };

    // Fetch initial registration counts
    const fetchRegistrations = async () => {
      const { data, error } = await supabase
        .from('registrations')
        .select('event_id');
      
      if (error) {
        console.error('Error fetching registrations:', error);
        return;
      }

      // Count registrations per event
      const counts = (data || []).reduce((acc: any, reg) => {
        acc[reg.event_id] = (acc[reg.event_id] || 0) + 1;
        return acc;
      }, {});

      console.log('Registration counts:', counts);
      setRegistrations(counts);
    };

    fetchEvents();
    fetchRegistrations();

    // Subscribe to events changes
    const eventsSubscription = supabase
      .channel('events-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' },
        (payload) => {
          console.log('Events change received:', payload);
          fetchEvents();
        }
      )
      .subscribe();

    // Subscribe to registrations changes
    const registrationsSubscription = supabase
      .channel('registrations-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        (payload) => {
          console.log('Registrations change received:', payload);
          fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
      registrationsSubscription.unsubscribe();
    };
  }, []);

  const today = new Date();
  const upcomingEvents = events.filter(event => new Date(event.date) >= today);
  const pastEvents = events.filter(event => new Date(event.date) < today);

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#1A1F2C]" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-8 space-y-12">
        <EventsSection 
          title="الفعاليات القادمة"
          events={upcomingEvents}
          registrations={registrations}
        />
        
        <EventsSection 
          title="الفعاليات السابقة"
          events={pastEvents}
          registrations={registrations}
          isPastEvents
        />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
