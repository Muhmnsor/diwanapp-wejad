import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const EventDetails = () => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();

  console.log('EventDetails - User:', user);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) {
          setError("معرف الفعالية غير موجود");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Error fetching event:", fetchError);
          setError("حدث خطأ في جلب بيانات الفعالية");
          return;
        }

        if (!data) {
          setError("الفعالية غير موجودة");
          return;
        }

        console.log("Fetched event:", data);
        setEvent(data);
      } catch (err) {
        console.error("Error in fetchEvent:", err);
        setError("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <>
        <TopHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
        <Footer />
      </>
    );
  }

  const isAdmin = user?.isAdmin;
  console.log('EventDetails - isAdmin:', isAdmin);

  const handleEdit = () => {
    console.log("Edit event clicked");
  };

  const handleDelete = () => {
    console.log("Delete event clicked");
  };

  const handleAddToCalendar = () => {
    console.log("Add to calendar clicked");
  };

  if (!event) {
    return null;
  }

  if (!isAdmin) {
    return (
      <>
        <TopHeader />
        <EventDetailsView
          event={event}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToCalendar={handleAddToCalendar}
          id={id!}
        />
        <Footer />
      </>
    );
  }

  return (
    <>
      <TopHeader />
      <div className="min-h-screen bg-gray-50/50">
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
      <Footer />
    </>
  );
};

export default EventDetails;