import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventDetailsContainer } from "@/components/events/details/EventDetailsContainer";
import { EventNotFound } from "@/components/events/EventNotFound";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('No user logged in');
        return;
      }

      try {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
          return;
        }

        if (userRoles && userRoles.length > 0) {
          const { data: roles, error: roleError } = await supabase
            .from('roles')
            .select('name')
            .eq('id', userRoles[0].role_id)
            .maybeSingle();

          if (roleError) {
            console.error('Error fetching role:', roleError);
            return;
          }

          setIsAdmin(roles?.name === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        console.error('No event ID provided');
        setError('لم يتم العثور على معرف الفعالية');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching event with ID:', id);
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select(`
            id,
            title,
            description,
            date,
            time,
            location,
            location_url,
            image_url,
            event_type,
            price,
            max_attendees,
            beneficiary_type,
            certificate_type,
            event_hours,
            event_path,
            event_category
          `)
          .eq("id", id)
          .maybeSingle();

        if (eventError) {
          console.error("Error fetching event:", eventError);
          setError("حدث خطأ في جلب بيانات الفعالية");
          toast.error("حدث خطأ في جلب بيانات الفعالية");
          return;
        }

        if (!eventData) {
          console.log('No event found with ID:', id);
          setError("لم يتم العثور على الفعالية");
          toast.error("لم يتم العثور على الفعالية");
          return;
        }

        console.log('Event data fetched successfully:', eventData);

        // Get registrations count
        const { count: registrationsCount, error: registrationsError } = await supabase
          .from("registrations")
          .select("*", { count: 'exact', head: true })
          .eq("event_id", id);

        if (registrationsError) {
          console.error("Error fetching registrations count:", registrationsError);
        }

        const eventWithAttendees = {
          ...eventData,
          attendees: registrationsCount || 0,
          event_path: eventData.event_path || 'environment',
          event_category: eventData.event_category || 'social'
        };

        console.log('Event with attendees:', eventWithAttendees);
        setEvent(eventWithAttendees);
        setError(null);
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("حدث خطأ غير متوقع");
        toast.error("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchEvent();
  }, [id]);

  const handleEdit = () => {
    navigate(`/events/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("تم حذف الفعالية بنجاح");
      navigate("/");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("حدث خطأ أثناء حذف الفعالية");
    }
  };

  const handleAddToCalendar = () => {
    toast.success("تمت إضافة الفعالية إلى التقويم");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow">
          <EventLoadingState />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow">
          <EventNotFound message={error || "لم يتم العثور على الفعالية"} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow">
        <EventDetailsContainer
          event={event}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToCalendar={handleAddToCalendar}
          id={id}
          onRegister={() => navigate(`/events/${id}/register`)}
        />
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;