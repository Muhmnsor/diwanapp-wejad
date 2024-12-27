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

const EventDetails = () => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) {
          console.error('No event ID provided');
          setError("معرف الفعالية غير موجود");
          setLoading(false);
          return;
        }

        console.log('Fetching event with ID:', id);
        
        const { data: eventData, error: fetchError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching event:", fetchError);
          setError("حدث خطأ في جلب بيانات الفعالية");
          setLoading(false);
          return;
        }

        if (!eventData) {
          console.log('No event found with ID:', id);
          setError("الفعالية غير موجودة");
          setLoading(false);
          return;
        }

        console.log("Fetched event data:", eventData);
        setEvent(eventData);
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchEvent:", err);
        setError("حدث خطأ غير متوقع");
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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

  const isAdmin = user?.isAdmin;

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

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">لا توجد بيانات متاحة</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 py-12">
          <EventDetailsView
            event={event}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToCalendar={handleAddToCalendar}
            id={id!}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 py-12">
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
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;