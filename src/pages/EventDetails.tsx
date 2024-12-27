import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import EventDetailsView from "@/components/events/EventDetailsView";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id);

      if (userRoles && userRoles.length > 0) {
        const { data: roles } = await supabase
          .from('roles')
          .select('name')
          .eq('id', userRoles[0].role_id)
          .single();

        setIsAdmin(roles?.name === 'admin');
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        console.error('No event ID provided');
        return;
      }

      try {
        console.log('Fetching event with ID:', id);
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) {
          console.error("Error fetching event:", eventError);
          toast.error("حدث خطأ في جلب بيانات الفعالية");
          return;
        }

        if (!eventData) {
          console.log('No event found with ID:', id);
          toast.error("لم يتم العثور على الفعالية");
          return;
        }

        console.log('Event data fetched successfully:', eventData);
        setEvent(eventData);
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
    // Navigate to edit page
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
    // Add to calendar logic
    toast.success("تمت إضافة الفعالية إلى التقويم");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">لم يتم العثور على الفعالية</div>;
  }

  return (
    <EventDetailsView
      event={event}
      isAdmin={isAdmin}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddToCalendar={handleAddToCalendar}
      id={id!}
    />
  );
};

export default EventDetails;
