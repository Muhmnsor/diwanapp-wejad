import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/event";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const EventDetails = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        // First fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) throw eventError;

        // Then fetch registration fields
        const { data: fieldsData, error: fieldsError } = await supabase
          .from("event_registration_fields")
          .select("*")
          .eq("event_id", id)
          .single();

        if (fieldsError && fieldsError.code !== 'PGRST116') { // Ignore not found error
          throw fieldsError;
        }

        const eventWithFields: Event = {
          ...eventData,
          registration_fields: fieldsData || {
            arabic_name: true,
            email: true,
            phone: true,
            english_name: false,
            education_level: false,
            birth_date: false,
            national_id: false,
            gender: false,
            work_status: false,
          }
        };

        setEvent(eventWithFields);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("حدث خطأ في جلب بيانات الفعالية");
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleEdit = () => {
    navigate(`/events/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm("هل أنت متأكد من حذف هذه الفعالية؟");
    if (!confirmed) return;

    try {
      // First delete related registrations
      const { error: registrationsError } = await supabase
        .from("registrations")
        .delete()
        .eq("event_id", id);

      if (registrationsError) throw registrationsError;

      // Then delete registration fields
      const { error: fieldsError } = await supabase
        .from("event_registration_fields")
        .delete()
        .eq("event_id", id);

      if (fieldsError) throw fieldsError;

      // Finally delete the event
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (eventError) throw eventError;

      toast.success("تم حذف الفعالية بنجاح");
      navigate("/");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("حدث خطأ أثناء حذف الفعالية");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">الفعالية غير موجودة</div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = user?.isAdmin;

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 py-12">
        <EventDetailsView
          event={event}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToCalendar={() => {}}
          onRegister={() => {}}
          id={id}
        />
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;
