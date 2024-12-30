import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { useAuthStore } from "@/store/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDashboard } from "@/components/admin/EventDashboard";
import { EventContent } from "@/components/events/EventContent";

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
          setError("معرف الفعالية غير موجود");
          return;
        }

        console.log("Fetching event with ID:", id);
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
          console.log("No event found with ID:", id);
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

  const handleEdit = () => {
    console.log("Edit event clicked");
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      const { error: deleteError } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      toast.success("تم حذف الفعالية بنجاح");
      navigate("/");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("حدث خطأ أثناء حذف الفعالية");
    }
  };

  const handleAddToCalendar = () => {
    console.log("Add to calendar clicked");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
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
      <div className="min-h-screen flex flex-col" dir="rtl">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = user?.isAdmin;

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <main className="flex-1">
        {isAdmin ? (
          <div className="bg-gray-50/50">
            <EventDetailsView
              event={event}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddToCalendar={handleAddToCalendar}
              id={id!}
            >
              <Tabs defaultValue="details" className="w-full">
                <div className="bg-white">
                  <div className="container mx-auto">
                    <TabsList 
                      className="w-full justify-start rounded-none bg-transparent h-auto" 
                      dir="rtl"
                    >
                      <TabsTrigger 
                        value="details" 
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2"
                      >
                        تفاصيل الفعالية
                      </TabsTrigger>
                      <TabsTrigger 
                        value="dashboard"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2"
                      >
                        لوحة التحكم
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <div className="container mx-auto px-4 pb-8" dir="rtl">
                  <TabsContent value="details" className="mt-6">
                    <EventContent 
                      event={event}
                      onRegister={() => {}}
                    />
                  </TabsContent>

                  <TabsContent value="dashboard" className="mt-6">
                    <EventDashboard eventId={id!} />
                  </TabsContent>
                </div>
              </Tabs>
            </EventDetailsView>
          </div>
        ) : (
          <EventDetailsView
            event={event}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToCalendar={handleAddToCalendar}
            id={id!}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EventDetails;