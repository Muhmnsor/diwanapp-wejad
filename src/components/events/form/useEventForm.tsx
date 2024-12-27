import { useState } from "react";
import { Event } from "@/store/eventStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useEventForm = (id?: string) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Event>({
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
    beneficiary_type: "both",
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
    event_category: "social"
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
        beneficiary_type: formData.beneficiary_type,
        event_type: formData.event_type,
        image_url: formData.image_url || formData.imageUrl,
        registration_start_date: formData.registration_start_date || formData.registrationStartDate,
        registration_end_date: formData.registration_end_date || formData.registrationEndDate,
        event_path: formData.event_path,
        event_category: formData.event_category
      };

      let result;
      
      if (id) {
        console.log('Updating event with ID:', id);
        result = await supabase
          .from("events")
          .update(eventData)
          .eq("id", id);
      } else {
        console.log('Creating new event');
        result = await supabase
          .from("events")
          .insert([eventData]);
      }

      if (result.error) throw result.error;

      await queryClient.invalidateQueries({ queryKey: ["events"] });

      toast.success(id ? "تم تحديث الفعالية بنجاح" : "تم إنشاء الفعالية بنجاح");
      return true;
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(id ? "حدث خطأ أثناء تحديث الفعالية" : "حدث خطأ أثناء إنشاء الفعالية");
      return false;
    }
  };

  return {
    formData,
    setFormData,
    isUploading,
    handleImageChange,
    handleSubmit
  };
};