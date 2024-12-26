import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventNotFound } from "@/components/events/EventNotFound";
import { toast } from "sonner";

const EventDetails = () => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log("Fetching event details for ID:", id);
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching event:", error);
          setError(error.message);
          toast.error("حدث خطأ في جلب تفاصيل الفعالية");
          return;
        }

        if (!data) {
          console.log("No event found with ID:", id);
          setError("Event not found");
          return;
        }

        console.log("Event details fetched successfully:", data);
        setEvent(data);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
        toast.error("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return <EventLoadingState />;
  }

  if (error || !event) {
    return <EventNotFound />;
  }

  const isAdmin = user?.isAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow">
        <EventDetailsView event={event} isAdmin={isAdmin} />
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;