import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventFormFields } from "../EventFormFields";
import { EventFormActions } from "./EventFormActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface CreateEventFormProps {
  initialData?: Event;
  onSuccess: () => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

export const CreateEventForm = ({
  initialData,
  onSuccess,
  onCancel,
  isEditMode = false
}: CreateEventFormProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Event>(initialData || {
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    certificate_type: "none",
    certificateType: "none",
    event_hours: 0,
    eventHours: 0,
    price: "free",
    max_attendees: 0,
    beneficiaryType: "both",
    event_type: "in-person",
    eventType: "in-person",
    attendees: 0,
    imageUrl: "",
    image_url: "",
    registrationStartDate: "",
    registrationEndDate: "",
    registration_start_date: "",
    registration_end_date: "",
    event_path: "environment",
    event_category: "social",
    arabic_name: false,
    english_name: false,
    education_level: false,
    birth_date: false,
    national_id: false,
    email: true,
    phone: true
  });

  const handleImageChange = async (file: File | null) => {
    if (file) {
      setIsUploading(true);
      try {
        const fileName = `event-images/${Date.now()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(fileName);

        setFormData(prev => ({
          ...prev,
          imageUrl: publicUrl,
          image_url: publicUrl
        }));

        toast.success("تم رفع الصورة بنجاح");
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error("حدث خطأ أثناء رفع الصورة");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        certificate_type: formData.certificate_type,
        event_hours: formData.event_hours,
        price: formData.price === "free" ? null : formData.price,
        max_attendees: formData.max_attendees,
        beneficiary_type: formData.beneficiaryType,
        event_type: formData.event_type,
        image_url: formData.image_url || formData.imageUrl,
        registration_start_date: formData.registration_start_date || formData.registrationStartDate,
        registration_end_date: formData.registration_end_date || formData.registrationEndDate,
        event_path: formData.event_path,
        event_category: formData.event_category
      };

      const registrationFieldsData = {
        arabic_name: formData.arabic_name,
        english_name: formData.english_name,
        education_level: formData.education_level,
        birth_date: formData.birth_date,
        national_id: formData.national_id,
        email: formData.email,
        phone: formData.phone
      };

      if (isEditMode && initialData?.id) {
        console.log('Updating event with ID:', initialData.id);
        const { error: eventError } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", initialData.id);

        if (eventError) throw eventError;

        const { error: fieldsError } = await supabase
          .from("event_registration_fields")
          .upsert({
            ...registrationFieldsData,
            event_id: initialData.id
          });

        if (fieldsError) throw fieldsError;
      } else {
        console.log('Creating new event');
        const { data: newEvent, error: eventError } = await supabase
          .from("events")
          .insert([eventData])
          .select()
          .single();

        if (eventError) throw eventError;
        
        const { error: fieldsError } = await supabase
          .from("event_registration_fields")
          .insert([{
            ...registrationFieldsData,
            event_id: newEvent.id
          }]);

        if (fieldsError) throw fieldsError;
      }

      await queryClient.invalidateQueries({ queryKey: ["events"] });

      toast.success(isEditMode ? "تم تحديث الفعالية بنجاح" : "تم إنشاء الفعالية بنجاح");
      onSuccess();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(isEditMode ? "حدث خطأ أثناء تحديث الفعالية" : "حدث خطأ أثناء إنشاء الفعالية");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EventFormFields 
        formData={formData} 
        setFormData={setFormData}
        onImageChange={handleImageChange}
      />
      <EventFormActions 
        isUploading={isUploading}
        onCancel={onCancel}
      />
    </form>
  );
};