import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EditEventForm } from "../EditEventForm";
import { handleImageUpload } from "./EventImageUpload";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface EditEventFormContainerProps {
  event: Event;
  onSave: (event: Event) => Promise<void>;
  onCancel: () => void;
}

export const EditEventFormContainer = ({ 
  event, 
  onSave, 
  onCancel 
}: EditEventFormContainerProps) => {
  const [formData, setFormData] = useState<Event>({
    ...event,
    eventType: event.event_type || event.eventType,
    beneficiaryType: event.beneficiary_type || event.beneficiaryType,
    certificateType: event.certificate_type || event.certificateType,
    eventHours: event.event_hours || event.eventHours,
    registrationStartDate: event.registration_start_date || event.registrationStartDate,
    registrationEndDate: event.registration_end_date || event.registrationEndDate,
    location_url: event.location_url,
    registration_fields: event.registration_fields || {
      arabic_name: true,
      email: true,
      phone: true,
      english_name: false,
      education_level: false,
      birth_date: false,
      national_id: false,
      gender: false,
      work_status: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  console.log('Form data in EditEventFormContainer:', formData);
  console.log('Registration fields in EditEventFormContainer:', formData.registration_fields);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      if (!formData.title || !formData.date || !formData.time || !formData.location) {
        toast.error("يرجى تعبئة جميع الحقول المطلوبة");
        return;
      }

      let imageUrl = formData.imageUrl || formData.image_url;
      if (imageFile) {
        const { publicUrl, error } = await handleImageUpload(imageFile);
        if (error) {
          toast.error("حدث خطأ أثناء رفع الصورة");
          return;
        }
        imageUrl = publicUrl;
      }

      const price = formData.price === "free" ? null : formData.price;

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
        location_url: formData.location_url,
        price: price,
        registration_fields: formData.registration_fields
      };

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
    <EditEventForm
      formData={formData}
      setFormData={setFormData}
      onImageChange={setImageFile}
      onSave={handleSave}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};