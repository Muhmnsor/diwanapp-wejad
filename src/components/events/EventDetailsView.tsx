import { useEffect, useState } from "react";
import { Event } from "@/store/eventStore";
import { EditEventDialog } from "./EditEventDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EventContent } from "./EventContent";
import { EventImage } from "./EventImage";
import { EventTitle } from "./EventTitle";
import { EventRegistrationDialog } from "./EventRegistrationDialog";
import { useAuthStore } from "@/store/authStore";
import { EventDeleteDialog } from "./details/EventDeleteDialog";
import { handleEventDeletion } from "./details/EventDeletionHandler";

interface EventDetailsViewProps {
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister?: () => void;
  id: string;
}

export const EventDetailsView = ({
  event,
  isAdmin,
  onEdit,
  onDelete,
  onAddToCalendar,
  onRegister,
  id
}: EventDetailsViewProps) => {
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    console.log('EventDetailsView - Initial event:', event);
    if (event) {
      setCurrentEvent(event);
    }
  }, [event]);

  const handleUpdateEvent = async (updatedEvent: Event) => {
    try {
      console.log('Updating event with:', updatedEvent);
      
      const { error } = await supabase
        .from('events')
        .update({
          title: updatedEvent.title,
          description: updatedEvent.description,
          date: updatedEvent.date,
          time: updatedEvent.time,
          location: updatedEvent.location,
          location_url: updatedEvent.location_url,
          image_url: updatedEvent.image_url || updatedEvent.imageUrl,
          event_type: updatedEvent.event_type || updatedEvent.eventType,
          price: updatedEvent.price,
          max_attendees: updatedEvent.max_attendees,
          registration_start_date: updatedEvent.registration_start_date || updatedEvent.registrationStartDate,
          registration_end_date: updatedEvent.registration_end_date || updatedEvent.registrationEndDate,
          beneficiary_type: updatedEvent.beneficiary_type || updatedEvent.beneficiaryType,
          certificate_type: updatedEvent.certificate_type || updatedEvent.certificateType,
          event_hours: updatedEvent.event_hours || updatedEvent.eventHours,
          event_path: updatedEvent.event_path,
          event_category: updatedEvent.event_category
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating event:', error);
        throw error;
      }

      setCurrentEvent(updatedEvent);
      onEdit();
      toast.success('تم تحديث الفعالية بنجاح');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('حدث خطأ أثناء تحديث الفعالية');
    }
  };

  const handleRegister = () => {
    console.log('Opening registration dialog');
    setIsRegistrationOpen(true);
  };

  const handleDelete = async () => {
    try {
      await handleEventDeletion({
        eventId: id,
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          onDelete();
        }
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('حدث خطأ أثناء حذف الفعالية');
    }
  };

  if (!currentEvent) {
    console.log('No current event available');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EventImage imageUrl={currentEvent.image_url || currentEvent.imageUrl} title={currentEvent.title} />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <EventTitle
            title={currentEvent.title}
            isAdmin={isAdmin}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onAddToCalendar={onAddToCalendar}
          />

          <EventContent 
            event={currentEvent}
            onRegister={handleRegister}
          />
        </div>
      </div>

      <EditEventDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        event={currentEvent} 
        onSave={handleUpdateEvent} 
      />

      <EventRegistrationDialog
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
        event={currentEvent}
      />

      <EventDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};