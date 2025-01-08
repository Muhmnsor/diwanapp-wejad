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

      return data;
    },
    enabled: !isCreatePage // Don't run the query if we're on create page
  });

  const handleEdit = () => {
    // Handle edit functionality
    console.log('Edit event:', id);
  };

  const handleDelete = () => {
    // Handle delete functionality
    console.log('Delete event:', id);
    navigate('/');
  };

  const handleAddToCalendar = () => {
    // Handle add to calendar functionality
    console.log('Add to calendar:', id);
    toast.success('تمت إضافة الفعالية إلى التقويم');
  };

  if (isCreatePage) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">إنشاء فعالية جديدة</h1>
          {/* Your create event form component here */}
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return <EventLoadingState />;
  }

  if (error) {
    console.error('Error in event details:', error);
    return <EventNotFound />;
  }

  if (!event) {
    return <EventNotFound />;
  }

  // Check if user is admin (you might want to adjust this based on your actual admin check logic)
  const isAdmin = user?.role === 'admin';

  return (
    <EventDetailsView 
      event={event}
      isAdmin={isAdmin}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddToCalendar={handleAddToCalendar}
      id={id || ''}
    />
  );
};

export default EventDetails;