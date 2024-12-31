import { Event } from "@/store/eventStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleEventUpdate = async (formData: Event, eventId?: string) => {
  if (!eventId) return;

  try {
    console.log('Updating event with data:', formData);
    
    // Update event data
    const { error: eventError } = await supabase
      .from('events')
      .update({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        image_url: formData.image_url,
        event_type: formData.event_type,
        price: formData.price === null ? null : formData.price,
        max_attendees: formData.max_attendees,
        beneficiary_type: formData.beneficiary_type,
        certificate_type: formData.certificate_type,
        event_path: formData.event_path,
        event_category: formData.event_category,
        registration_start_date: formData.registration_start_date,
        registration_end_date: formData.registration_end_date,
        event_hours: formData.event_hours
      })
      .eq('id', eventId);

    if (eventError) throw eventError;

    // Update registration fields
    const { error: fieldsError } = await supabase
      .from('event_registration_fields')
      .update({
        arabic_name: formData.registration_fields.arabic_name,
        english_name: formData.registration_fields.english_name,
        education_level: formData.registration_fields.education_level,
        birth_date: formData.registration_fields.birth_date,
        national_id: formData.registration_fields.national_id,
        email: formData.registration_fields.email,
        phone: formData.registration_fields.phone,
        gender: formData.registration_fields.gender,
        work_status: formData.registration_fields.work_status
      })
      .eq('event_id', eventId);

    if (fieldsError) throw fieldsError;

    return true;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};