import { useParams } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventNotFound } from "@/components/events/EventNotFound";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EventDetails = () => {
  const { id } = useParams();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <EventLoadingState />;
  if (!event) return <EventNotFound />;

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <EventDetailsView event={event} />
      </div>
      <Footer />
    </div>
  );
};

export default EventDetails;