import { useParams, useNavigate } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventNotFound } from "@/components/events/EventNotFound";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleEventDeletion } from "@/components/events/details/EventDeletionHandler";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      console.log("Fetching event details for id:", id);
      
      if (!id) {
        console.error("No event ID provided");
        return null;
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }

      console.log("Event data fetched:", data);
      return data;
    },
  });

  const handleEdit = () => {
    navigate(`/event/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;
    await handleEventDeletion({
      eventId: id,
      onSuccess: () => navigate("/")
    });
  };

  const handleAddToCalendar = () => {
    toast.success("تمت إضافة الفعالية إلى التقويم");
  };

  const handleRegister = () => {
    toast.success("تم التسجيل في الفعالية");
  };

  if (isLoading) {
    console.log("Loading event details...");
    return <EventLoadingState />;
  }

  if (error) {
    console.error("Error loading event:", error);
    toast.error("حدث خطأ في تحميل تفاصيل الفعالية");
    return <EventNotFound />;
  }

  if (!event) {
    console.log("Event not found");
    return <EventNotFound />;
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <EventDetailsView 
          event={event}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToCalendar={handleAddToCalendar}
          onRegister={handleRegister}
          id={id || ''}
        />
      </div>
      <Footer />
    </div>
  );
};

export default EventDetails;