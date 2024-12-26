import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventFormFields } from "./EventFormFields";
import { EditEventFormActions } from "./form/EditEventFormActions";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditEventFormProps {
  event: Event;
  onSave: (event: Event) => Promise<void>;
  onCancel: () => void;
}

export const EditEventForm = ({ event, onSave, onCancel }: EditEventFormProps) => {
  // Initialize form data with normalized field names
  const [formData, setFormData] = useState<Event>({
    ...event,
    eventType: event.event_type || event.eventType,
    beneficiaryType: event.beneficiary_type || event.beneficiaryType,
    certificateType: event.certificate_type || event.certificateType,
    eventHours: event.event_hours || event.eventHours,
    registrationStartDate: event.registration_start_date || event.registrationStartDate,
    registrationEndDate: event.registration_end_date || event.registrationEndDate,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  console.log('Form data in EditEventForm:', formData);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!formData.title || !formData.date || !formData.time || !formData.location) {
        toast.error("يرجى تعبئة جميع الحقول المطلوبة");
        return;
      }

      // If there's a new image file, upload it first
      let imageUrl = formData.imageUrl || formData.image_url;
      if (imageFile) {
        const fileName = `event-images/${Date.now()}.${imageFile.name.split('.').pop()}`;
        const { error: uploadError, data } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error("حدث خطأ أثناء رفع الصورة");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Prepare the event data for saving with both snake_case and camelCase fields
      const eventToSave: Event = {
        ...formData,
        image_url: imageUrl,
        imageUrl: imageUrl,
        event_type: formData.eventType || formData.event_type,
        eventType: formData.eventType || formData.event_type,
        beneficiary_type: formData.beneficiaryType || formData.beneficiary_type,
        beneficiaryType: formData.beneficiaryType || formData.beneficiary_type,
        certificate_type: formData.certificateType || formData.certificate_type,
        certificateType: formData.certificateType || formData.certificate_type,
        event_hours: formData.eventHours || formData.event_hours,
        eventHours: formData.eventHours || formData.event_hours,
        registration_start_date: formData.registrationStartDate || formData.registration_start_date,
        registrationStartDate: formData.registrationStartDate || formData.registration_start_date,
        registration_end_date: formData.registrationEndDate || formData.registration_end_date,
        registrationEndDate: formData.registrationEndDate || formData.registration_end_date,
      };

      // Call the parent's onSave function
      await onSave(eventToSave);
      toast.success("تم حفظ التغييرات بنجاح");
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error("حدث خطأ أثناء حفظ التغييرات");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <EventFormFields
        formData={formData}
        setFormData={setFormData}
        onImageChange={setImageFile}
      />
      <EditEventFormActions
        onSave={handleSave}
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </div>
  );
};