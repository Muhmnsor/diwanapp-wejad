import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventDetailsContainer } from "@/components/events/details/EventDetailsContainer";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log('No user logged in');
        return;
      }

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
          .single();

        if (roleError) {
          console.error('Error fetching role:', roleError);
          return;
        }

        console.log('User role:', roles?.name);
        setIsAdmin(roles?.name === 'admin');
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        console.error('No event ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching event with ID:', id);
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select(`
            *,
            registrations (
              id
            )
          `)
          .eq("id", id)
          .maybeSingle();

        if (eventError) {
          console.error("Error fetching event:", eventError);
          toast.error("حدث خطأ في جلب بيانات الفعالية");
          setLoading(false);
          return;
        }

        if (!eventData) {
          console.log('No event found with ID:', id);
          toast.error("لم يتم العثور على الفعالية");
          setLoading(false);
          return;
        }

        console.log('Event data fetched successfully:', eventData);
        
        // Calculate attendees count from registrations
        const attendeesCount = eventData.registrations ? eventData.registrations.length : 0;
        const eventWithAttendees = {
          ...eventData,
          attendees: attendeesCount
        };
        
        console.log('Event with attendees count:', eventWithAttendees);
        setEvent(eventWithAttendees);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("حدث خطأ غير متوقع");
      } finally {
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

  console.log('Current event state:', event);
  console.log('Loading state:', loading);
  console.log('Is admin:', isAdmin);

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow">
        {loading ? (
          <EventLoadingState />
        ) : !event ? (
          <div className="container mx-auto px-4 py-8 text-center">
            لم يتم العثور على الفعالية
          </div>
        ) : (
          <EventDetailsContainer
            event={event}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToCalendar={handleAddToCalendar}
            id={id!}
            onRegister={() => navigate(`/events/${id}/register`)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;