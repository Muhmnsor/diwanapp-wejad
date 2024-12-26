import { useState, useEffect } from "react";
import { Event } from "@/store/eventStore";
import { EventFormFields } from "./EventFormFields";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditEventFormProps {
  event: Event;
  onSave: (updatedEvent: Event) => void;
  onCancel: () => void;
}

export const EditEventForm = ({ event, onSave, onCancel }: EditEventFormProps) => {
  console.log('Initial event data:', event);
  
  const [formData, setFormData] = useState<Event>({
    id: event.id,
    title: event.title,
    description: event.description || '',
    date: event.date,
    time: event.time,
    location: event.location,
    imageUrl: event.imageUrl || event.image_url,
    image_url: event.image_url || event.imageUrl,
    certificateType: event.certificateType || event.certificate_type || 'none',
    certificate_type: event.certificate_type || event.certificateType || 'none',
    eventHours: event.eventHours || event.event_hours || 0,
    event_hours: event.event_hours || event.eventHours || 0,
    price: event.price || 'free',
    max_attendees: event.max_attendees || 0,
    beneficiaryType: event.beneficiaryType || event.beneficiary_type || 'both',
    beneficiary_type: event.beneficiary_type || event.beneficiaryType || 'both',
    event_type: event.event_type || 'in-person',
    eventType: event.eventType || event.event_type || 'in-person',
    attendees: event.attendees || 0,
    registrationStartDate: event.registrationStartDate || event.registration_start_date,
    registrationEndDate: event.registrationEndDate || event.registration_end_date,
    registration_start_date: event.registration_start_date || event.registrationStartDate,
    registration_end_date: event.registration_end_date || event.registrationEndDate
  });

  useEffect(() => {
    console.log('Form data updated:', formData);
    setFormData({
      id: event.id,
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl || event.image_url,
      image_url: event.image_url || event.imageUrl,
      certificateType: event.certificateType || event.certificate_type || 'none',
      certificate_type: event.certificate_type || event.certificateType || 'none',
      eventHours: event.eventHours || event.event_hours || 0,
      event_hours: event.event_hours || event.eventHours || 0,
      price: event.price || 'free',
      max_attendees: event.max_attendees || 0,
      beneficiaryType: event.beneficiaryType || event.beneficiary_type || 'both',
      beneficiary_type: event.beneficiary_type || event.beneficiaryType || 'both',
      event_type: event.event_type || 'in-person',
      eventType: event.eventType || event.event_type || 'in-person',
      attendees: event.attendees || 0,
      registrationStartDate: event.registrationStartDate || event.registration_start_date,
      registrationEndDate: event.registrationEndDate || event.registration_end_date,
      registration_start_date: event.registration_start_date || event.registrationStartDate,
      registration_end_date: event.registration_end_date || event.registrationEndDate
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        image_url: formData.imageUrl || formData.image_url,
        certificate_type: formData.certificateType || formData.certificate_type,
        event_hours: formData.eventHours || formData.event_hours,
        event_type: formData.eventType || formData.event_type,
        price: formData.price === 'free' ? null : formData.price,
        max_attendees: formData.max_attendees,
        beneficiary_type: formData.beneficiaryType || formData.beneficiary_type,
        registration_start_date: formData.registrationStartDate || formData.registration_start_date,
        registration_end_date: formData.registrationEndDate || formData.registration_end_date
      };
      
      console.log('Updating event with data:', updateData);

      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', event.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        toast.error('حدث خطأ في تحديث الفعالية');
        throw error;
      }

      console.log('Event updated successfully:', data);
      toast.success('تم تحديث الفعالية بنجاح');
      onSave({ ...data, attendees: formData.attendees });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('حدث خطأ في تحديث الفعالية');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EventFormFields
        formData={formData}
        setFormData={setFormData}
      />
      
      <div className="flex justify-end gap-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          إلغاء
        </Button>
        <Button type="submit">
          حفظ التغييرات
        </Button>
      </div>
    </form>
  );
};