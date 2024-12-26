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
import { Event } from "@/store/eventStore";
import { useUserRoles } from "@/components/events/admin/useUserRoles";

interface EventWithAttendees extends Event {
  attendees: number;
}

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: userRoles = [] } = useUserRoles();
  const isAdmin = userRoles.includes('admin');

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      console.log("Fetching event details for id:", id);
      
      if (!id) {
        console.error("No event ID provided");
        return null;
      }

      // First get the event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (eventError) {
        console.error("Error fetching event:", eventError);
        throw eventError;
      }

      if (!eventData) {
        console.log("No event found with id:", id);
        return null;
      }

      // Then get the count of registrations
      const { count: attendeesCount, error: countError } = await supabase
        .from("registrations")
        .select("*", { count: 'exact', head: true })
        .eq("event_id", id);

      if (countError) {
        console.error("Error fetching registrations count:", countError);
        throw countError;
      }

      const eventWithAttendees: EventWithAttendees = {
        ...eventData,
        attendees: attendeesCount || 0
      };

      console.log("Event data fetched:", eventWithAttendees);
      return eventWithAttendees;
    },
  });

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
    <div className="min-h-screen bg-[#F8F9FB]" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <EventDetailsView 
          event={event}
          onEdit={() => navigate(`/event/edit/${id}`)}
          onDelete={async () => {
            await handleEventDeletion({
              eventId: id!,
              onSuccess: () => navigate("/")
            });
          }}
          onAddToCalendar={() => {
            toast.success("تمت إضافة الفعالية إلى التقويم");
          }}
          onRegister={() => {
            toast.success("تم التسجيل في الفعالية");
          }}
          id={id!}
          isAdmin={isAdmin}
        />
      </div>
      <Footer />
    </div>
  );
};

export default EventDetails;