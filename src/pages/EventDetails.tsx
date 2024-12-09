import { Navigation } from "@/components/Navigation";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { EventRegistrationDialog } from "@/components/events/EventRegistrationDialog";
import { arabicToEnglishNum, convertArabicDate } from "@/utils/eventUtils";
import { createCalendarUrl } from "@/utils/calendarUtils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/store/eventStore";
import { useAuthStore } from "@/store/authStore";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const { user } = useAuthStore();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      console.log('Fetching event details for ID:', id);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      console.log('Fetched event details:', data);
      
      const transformedEvent: Event = {
        title: data.title,
        description: data.description || '',
        date: data.date,
        time: data.time,
        location: data.location,
        imageUrl: data.image_url,
        attendees: 0,
        maxAttendees: data.max_attendees,
        eventType: data.event_type as "online" | "in-person",
        price: data.price === null ? "free" : data.price,
      };

      return transformedEvent;
    },
  });

  const { data: registrationsCount = 0, isLoading: registrationsLoading } = useQuery({
    queryKey: ['registrations', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (error) {
        console.error('Error fetching registrations count:', error);
        throw error;
      }

      console.log('Fetched registrations count:', count);
      return count || 0;
    },
  });

  const handleAddToCalendar = () => {
    if (!event) return;

    try {
      const dateStr = arabicToEnglishNum(event.date);
      const timeStr = arabicToEnglishNum(event.time);
      
      console.log("Converting date:", dateStr, timeStr);
      const dateString = convertArabicDate(dateStr, timeStr);
      console.log("Parsed date string:", dateString);

      const eventDate = new Date(dateString);
      const endDate = new Date(eventDate.getTime() + (2 * 60 * 60 * 1000));

      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date conversion');
      }

      const calendarEvent = {
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: eventDate.toISOString().replace(/[-:]/g, '').split('.')[0],
        endDate: endDate.toISOString().replace(/[-:]/g, '').split('.')[0],
      };

      const calendarUrl = createCalendarUrl(calendarEvent);
      window.open(calendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error("لم نتمكن من إضافة الفعالية إلى التقويم");
    }
  };

  const isLoading = eventLoading || registrationsLoading;

  if (isLoading) {
    return (
      <div dir="rtl">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-xl">جاري تحميل تفاصيل الفعالية...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !id) {
    return (
      <div dir="rtl">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">لم يتم العثور على الفعالية</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {user?.isAdmin ? (
          <Tabs defaultValue="details" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="details">تفاصيل الفعالية</TabsTrigger>
              <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <EventDetailsView
                event={{
                  ...event,
                  attendees: registrationsCount,
                }}
                onEdit={() => {}}
                onDelete={() => {}}
                onAddToCalendar={handleAddToCalendar}
                onRegister={() => setIsRegistrationOpen(true)}
              />
            </TabsContent>
            <TabsContent value="dashboard">
              <EventDashboard eventId={id} />
            </TabsContent>
          </Tabs>
        ) : (
          <EventDetailsView
            event={{
              ...event,
              attendees: registrationsCount,
            }}
            onEdit={() => {}}
            onDelete={() => {}}
            onAddToCalendar={handleAddToCalendar}
            onRegister={() => setIsRegistrationOpen(true)}
          />
        )}

        <EventRegistrationDialog
          open={isRegistrationOpen}
          onOpenChange={setIsRegistrationOpen}
          eventTitle={event.title}
          eventPrice={event.price}
        />
      </div>
    </div>
  );
};

export default EventDetails;