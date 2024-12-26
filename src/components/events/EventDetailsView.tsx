import { useEffect, useState } from "react";
import { Event } from "@/store/eventStore";
import { EventDetails } from "./details/EventDetails";
import { EventDetailsContainer } from "./details/EventDetailsContainer";
import { EventEditDialog } from "./EventEditDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EventDetailsViewProps {
  event: Event;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddToCalendar: () => void;
  onRegister: () => void;
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
  const [currentEvent, setCurrentEvent] = useState<Event | null>(event);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    setCurrentEvent(event);
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
          image_url: updatedEvent.image_url || updatedEvent.imageUrl,
          event_type: updatedEvent.event_type || updatedEvent.eventType,
          price: updatedEvent.price,
          max_attendees: updatedEvent.max_attendees,
          registration_start_date: updatedEvent.registration_start_date || updatedEvent.registrationStartDate,
          registration_end_date: updatedEvent.registration_end_date || updatedEvent.registrationEndDate,
          beneficiary_type: updatedEvent.beneficiary_type || updatedEvent.beneficiaryType,
          certificate_type: updatedEvent.certificate_type || updatedEvent.certificateType,
          event_hours: updatedEvent.event_hours || updatedEvent.eventHours
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state with the new event data
      setCurrentEvent({ 
        ...currentEvent, 
        ...updatedEvent,
        event_type: updatedEvent.event_type || updatedEvent.eventType,
        beneficiary_type: updatedEvent.beneficiary_type || updatedEvent.beneficiaryType,
        certificate_type: updatedEvent.certificate_type || updatedEvent.certificateType,
        event_hours: updatedEvent.event_hours || updatedEvent.eventHours,
        registration_start_date: updatedEvent.registration_start_date || updatedEvent.registrationStartDate,
        registration_end_date: updatedEvent.registration_end_date || updatedEvent.registrationEndDate,
      });
      
      toast.success('تم تحديث الفعالية بنجاح');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('حدث خطأ أثناء تحديث الفعالية');
    }
  };

  return (
    <div>
      <EventDetails 
        date={currentEvent?.date}
        time={currentEvent?.time}
        location={currentEvent?.location}
        eventType={currentEvent?.event_type}
        attendees={currentEvent?.attendees}
        maxAttendees={currentEvent?.max_attendees}
      />
      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={() => setIsEditDialogOpen(true)} className="btn btn-primary">تعديل</button>
          <button onClick={onDelete} className="btn btn-danger">حذف</button>
          <button onClick={onAddToCalendar} className="btn btn-secondary">إضافة إلى التقويم</button>
        </div>
      )}
      <EventEditDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        event={currentEvent} 
        onUpdateEvent={handleUpdateEvent} 
      />
    </div>
  );
};
