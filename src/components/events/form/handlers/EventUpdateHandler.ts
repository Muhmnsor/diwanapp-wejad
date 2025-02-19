
import { Event } from "@/store/eventStore";
import { supabase } from "@/integrations/supabase/client";

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
        event_hours: formData.event_hours,
        location_url: formData.location_url
      })
      .eq('id', eventId);

    if (eventError) {
      console.error('Error updating event:', eventError);
      throw eventError;
    }

    // First check if registration fields record exists
    const { data: existingFields, error: fetchError } = await supabase
      .from('event_registration_fields')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching registration fields:', fetchError);
      throw fetchError;
    }

    console.log('Existing registration fields:', existingFields);
    console.log('New registration fields:', formData.registration_fields);

    // Prepare registration fields data
    const registrationFieldsData = {
      event_id: eventId,
      arabic_name: formData.registration_fields.arabic_name,
      english_name: formData.registration_fields.english_name,
      education_level: formData.registration_fields.education_level,
      birth_date: formData.registration_fields.birth_date,
      national_id: formData.registration_fields.national_id,
      email: formData.registration_fields.email,
      phone: formData.registration_fields.phone,
      gender: formData.registration_fields.gender,
      work_status: formData.registration_fields.work_status
    };

    let fieldsError;
    if (existingFields) {
      // Update existing record
      const { error } = await supabase
        .from('event_registration_fields')
        .update(registrationFieldsData)
        .eq('event_id', eventId);
      fieldsError = error;
    } else {
      // Insert new record
      const { error } = await supabase
        .from('event_registration_fields')
        .insert(registrationFieldsData);
      fieldsError = error;
    }

    if (fieldsError) {
      console.error('Error updating/inserting registration fields:', fieldsError);
      throw fieldsError;
    }

    console.log('Event and registration fields updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};
