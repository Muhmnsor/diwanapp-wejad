import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventDetailsView from "@/components/events/EventDetailsView";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { handleEventDeletion } from "@/components/events/details/EventDeletionHandler";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventNotFound } from "@/components/events/EventNotFound";

const EventDetails = () => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        console.error('No event ID provided');
        setError("معرف الفعالية غير موجود");
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching event details for ID:', id);
        
        // First fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (eventError) {
          console.error("Error fetching event:", eventError);
          setError(eventError.message);
          toast.error("حدث خطأ في جلب بيانات الفعالية");
          setLoading(false);
          return;
        }

        if (!eventData) {
          console.log('No event found with ID:', id);
          setError("الفعالية غير موجودة");
          setLoading(false);
          return;
        }

        console.log('Event data fetched successfully:', eventData);

        // Then fetch registrations count using count() function
        const { data: registrationsData, error: countError } = await supabase
          .from("registrations")
          .select("id", { count: "exact" })
          .eq("event_id", id);

        if (countError) {
          console.error("Error fetching registrations count:", countError);
          toast.error("حدث خطأ في جلب عدد التسجيلات");
        }

        const registrationsCount = registrationsData?.length || 0;
        console.log('Registrations count:', registrationsCount);

        const finalEventData = {
          ...eventData,
          attendees: registrationsCount
        };

        console.log('Final event data:', finalEventData);
        
        setEvent(finalEventData);
        setError(null);
      } catch (err) {
        console.error("Unexpected error in fetchEvent:", err);
        setError("حدث خطأ غير متوقع");
        toast.error("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleEdit = () => {
    console.log("Edit event clicked");
  };

  const handleDelete = async () => {
    try {
      console.log("Delete event clicked");
      await handleEventDeletion({
        eventId: id!,
        onSuccess: () => {
          toast.success("تم حذف الفعالية بنجاح");
          navigate('/');
        }
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("حدث خطأ أثناء حذف الفعالية");
    }
  };

  const handleAddToCalendar = () => {
    console.log("Add to calendar clicked");
  };

  const renderContent = () => {
    if (loading) {
      return <EventLoadingState />;
    }

    if (error || !event) {
      return <EventNotFound />;
    }

    const isAdmin = user?.isAdmin;

    if (!isAdmin) {
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
    }

    return (
      <div className="bg-gray-50/50">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-white" dir="rtl">
            <TabsTrigger value="details">تفاصيل الفعالية</TabsTrigger>
            <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-0">
            <EventDetailsView
              event={event}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddToCalendar={handleAddToCalendar}
              id={id!}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6 px-4 md:px-8">
            <EventDashboard eventId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 py-12">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;