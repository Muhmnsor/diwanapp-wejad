import { Navigation } from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Facebook, Instagram, Linkedin, Twitter, Globe } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">الفعاليات القادمة</h2>
          {upcomingEvents.length === 0 ? (
            <div className="text-center text-gray-500">لا توجد فعاليات قادمة حالياً</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex justify-center">
                  <EventCard 
                    {...event}
                    attendees={registrations[event.id] || 0}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">الفعاليات السابقة</h2>
          {pastEvents.length === 0 ? (
            <div className="text-center text-gray-500">لا توجد فعاليات سابقة</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {pastEvents.map((event) => (
                <div key={event.id} className="flex justify-center">
                  <EventCard 
                    {...event}
                    attendees={registrations[event.id] || 0}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-16 py-8 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="flex items-center justify-center md:justify-start">
                <Logo className="w-24 h-24" />
              </div>
              
              <div className="text-center">
                <h3 className="font-bold text-xl mb-2">جمعية ديوان الشبابية</h3>
                <p className="text-gray-600 mb-1">المملكة العربية السعودية - المدينة المنورة</p>
                <p className="text-gray-600 mb-2">رقم الترخيص 5531</p>
                <a 
                  href="https://www.dfy.org.sa" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:text-primary/80 flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  www.dfy.org.sa
                </a>
              </div>

              <div className="flex justify-center md:justify-end space-x-4 rtl:space-x-reverse">
                <a href="https://twitter.com/d4ymed" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="https://instagram.com/d4ymed" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com/company/d4ymed" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;