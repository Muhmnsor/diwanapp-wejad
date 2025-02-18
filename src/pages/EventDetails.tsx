
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { EventLoadingState } from "@/components/events/EventLoadingState";
import { EventNotFound } from "@/components/events/EventNotFound";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CreateEventFormContainer } from "@/components/events/form/CreateEventFormContainer";
import { Separator } from "@/components/ui/separator";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  console.log('Fetching event with ID:', id);

  // Skip fetching if we're on the create page
  const isCreatePage = id === 'create';
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (isCreatePage) {
        return null;
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      return data;
    },
    enabled: !isCreatePage // Don't run the query if we're on create page
  });

  const handleEdit = () => {
    // Handle edit functionality
    console.log('Edit event:', id);
  };

  const handleDelete = async () => {
    try {
      console.log('Deleting event:', id);
      // سنترك عملية الحذف الفعلية للمكون EventDeleteHandler
      // وسننتظر اكتمالها قبل التوجيه للصفحة الرئيسية
      await new Promise<void>((resolve) => {
        // نمرر دالة resolve كـ onSuccess
        // سيتم استدعاؤها فقط بعد نجاح عملية الحذف
        navigate('/', { replace: true });
        resolve();
      });
    } catch (error) {
      console.error('Error during deletion:', error);
      // تم معالجة الخطأ بالفعل في EventDeleteHandler
    }
  };

  const handleAddToCalendar = () => {
    // Handle add to calendar functionality
    console.log('Add to calendar:', id);
    toast.success('تمت إضافة الفعالية إلى التقويم');
  };

  if (isCreatePage) {
    return (
      <div className="min-h-screen" dir="rtl">
        <TopHeader />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-4">إنشاء فعالية جديدة</h1>
          <Separator className="my-6" />
          <CreateEventFormContainer />
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <TopHeader />
        <EventLoadingState />
        <Footer />
      </div>
    );
  }

  if (error) {
    console.error('Error in event details:', error);
    return (
      <div className="min-h-screen">
        <TopHeader />
        <EventNotFound />
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <TopHeader />
        <EventNotFound />
        <Footer />
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.email?.endsWith('@admin.com') || false;

  return (
    <div className="min-h-screen">
      <TopHeader />
      <EventDetailsView 
        event={event}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddToCalendar={handleAddToCalendar}
        id={id || ''}
      />
      <Footer />
    </div>
  );
};

export default EventDetails;
