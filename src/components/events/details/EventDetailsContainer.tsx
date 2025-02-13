import { useEffect, useState } from "react";
import { Event } from "@/store/eventStore";
import { EventImage } from "../EventImage";
import { EventTitle } from "../EventTitle";
import { EventContent } from "../EventContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDashboard } from "@/components/admin/EventDashboard";

interface EventDetailsContainerProps {
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
  id: string;
}

export const EventDetailsContainer = ({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id
}: EventDetailsContainerProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [visibility, setVisibility] = useState(event.is_visible);

  console.log('EventDetailsContainer - isAdmin:', isAdmin);

  const handleVisibilityChange = async (visible: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_visible: visible })
        .eq('id', id);

      if (error) throw error;
      setVisibility(visible);
      toast.success(visible ? 'تم إظهار الفعالية' : 'تم إخفاء الفعالية');
    } catch (error) {
      console.error('Error updating event visibility:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الظهور');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50/80 to-transparent pb-12">
      <EventImage imageUrl={event.image_url} title={event.title} />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <EventTitle
            title={event.title}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={() => setShowDeleteDialog(true)}
            onAddToCalendar={onAddToCalendar}
            isVisible={visibility}
            onVisibilityChange={handleVisibilityChange}
          />

          {isAdmin ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-white" dir="rtl">
                <TabsTrigger value="details">تفاصيل الفعالية</TabsTrigger>
                <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-0">
                <EventContent event={event} onRegister={onRegister} />
              </TabsContent>

              <TabsContent value="dashboard" className="mt-6 px-4 md:px-8 pb-8">
                <EventDashboard eventId={id} />
              </TabsContent>
            </Tabs>
          ) : (
            <EventContent event={event} onRegister={onRegister} />
          )}
        </div>
      </div>
    </div>
  );
};