import { Navigation } from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";
import { useEventStore } from "@/store/eventStore";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Fetch initial events
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">الفعاليات القادمة</h1>
        {events.length === 0 ? (
          <div className="text-center text-gray-500">لا توجد فعاليات حالياً</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {events.map((event) => (
              <div key={event.id} className="flex justify-center">
                <EventCard 
                  {...event}
                  attendees={registrations[event.id] || 0}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;