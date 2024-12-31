import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Event } from "@/store/eventStore";
import { useQueryClient } from "@tanstack/react-query";

export const useEventForm = () => {
  const navigate = useNavigate();
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
    registration_fields: {
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
    setIsUploading(true);
    
    try {
      console.log('Creating event with data:', formData);
      
      // 1. Create the event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert([{
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          certificate_type: formData.certificateType,
          event_hours: formData.eventHours,
          price: formData.price === "free" ? null : formData.price,
          max_attendees: formData.max_attendees,
          beneficiary_type: formData.beneficiaryType,
          event_type: formData.eventType,
          image_url: formData.image_url || formData.imageUrl,
          registration_start_date: formData.registrationStartDate || formData.registration_start_date,
          registration_end_date: formData.registrationEndDate || formData.registration_end_date,
          event_path: formData.event_path,
          event_category: formData.event_category,
          location_url: formData.location_url
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // The trigger will automatically create the registration fields record
      // We don't need to create it manually anymore

      await queryClient.invalidateQueries({ queryKey: ["events"] });

      toast.success("تم إنشاء الفعالية بنجاح");
      navigate("/");
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("حدث خطأ أثناء إنشاء الفعالية");
    } finally {
      setIsUploading(false);
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