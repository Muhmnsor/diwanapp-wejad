
import { Event } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleEventUpdate = async (updatedEvent: Event, id: string): Promise<Event | null> => {
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
        image_url: updatedEvent.image_url,
        event_type: updatedEvent.event_type,
        price: updatedEvent.price,
        max_attendees: updatedEvent.max_attendees,
        registration_start_date: updatedEvent.registration_start_date,
        registration_end_date: updatedEvent.registration_end_date,
        beneficiary_type: updatedEvent.beneficiary_type,
        certificate_type: updatedEvent.certificate_type,
        event_hours: updatedEvent.event_hours,
        event_path: updatedEvent.event_path,
        event_category: updatedEvent.event_category
      })
      .eq('id', id);

    if (error) throw error;

    toast.success('تم تحديث الفعالية بنجاح');
    return updatedEvent;
  } catch (error) {
    console.error('Error updating event:', error);
    toast.error('حدث خطأ أثناء تحديث الفعالية');
    return null;
  }
};
