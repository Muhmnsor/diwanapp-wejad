
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventNotFound } from "@/components/events/EventNotFound";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CreateEventFormContainer } from "@/components/events/form/CreateEventFormContainer";
import { Separator } from "@/components/ui/separator";
import { Event } from "@/types/event";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  console.log('Fetching event with ID:', id);

  // Skip fetching if we're on the create page
  const isCreatePage = id === 'create';
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (isCreatePage) {
        return null;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      if (!data) return null;

      // Transform the data to match the Event type
      const eventData: Event = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time,
        location: data.location,
        location_url: data.location_url,
        image_url: data.image_url,
        attendees: data.attendees || 0,
        max_attendees: data.max_attendees,
        event_type: data.event_type as Event['event_type'],
        price: data.price,
        beneficiary_type: data.beneficiary_type as Event['beneficiary_type'],
        registration_start_date: data.registration_start_date,
        registration_end_date: data.registration_end_date,
        certificate_type: data.certificate_type,
        event_hours: data.event_hours,
        event_path: data.event_path as Event['event_path'],
        event_category: data.event_category as Event['event_category'],
        registration_fields: data.registration_fields
      };

      return eventData;
    },
    enabled: !isCreatePage
  });

  const handleEdit = () => {
    console.log('Edit event:', id);
  };

  const handleDelete = () => {
    console.log('Delete event:', id);
    navigate('/');
  };

  const handleAddToCalendar = () => {
    console.log('Add to calendar:', id);
    toast.success('تمت إضافة الفعالية إلى التقويم');
  };

  if (isCreatePage) {
    return (
      <div className="min-h-screen" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">إنشاء فعالية جديدة</h1>
          <Separator className="my-6" />
          <CreateEventFormContainer />
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopHeader />
        <EventLoadingState />
        <Footer />
      </div>
    );
  }

  if (error) {
    console.error('Error in event details:', error);
    return (
      <div className="min-h-screen">
        <TopHeader />
        <EventNotFound />
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <TopHeader />
        <EventNotFound />
        <Footer />
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.email?.endsWith('@admin.com') || false;

  return (
    <div className="min-h-screen">
      <TopHeader />
      <EventDetailsView 
        event={event}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddToCalendar={handleAddToCalendar}
        id={id || ''}
      />
      <Footer />
    </div>
  );
};

export default EventDetails;
