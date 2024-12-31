import { useState } from "react";
import { Event } from "@/store/eventStore";
import { EventFormFields } from "../EventFormFields";
import { handleImageUpload } from "./EventImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const CreateEventFormContainer = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Event>({
    id: "",
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    event_type: "in-person",
    price: null,
    max_attendees: 0,
    image_url: "",
    beneficiary_type: "both",
    certificate_type: "none",
    event_path: "environment",
    event_category: "social",
    registration_start_date: null,
    registration_end_date: null,
    attendees: 0,
    beneficiaryType: "both",
    event_hours: null,
    registration_fields: {
      arabic_name: true,
      english_name: false,
      education_level: false,
      birth_date: false,
      national_id: false,
      email: true,
      phone: true,
      gender: false,
      work_status: false,
    }
  });

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const { publicUrl, error } = await handleImageUpload(file);
      if (error) throw error;
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Insert event data
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([{
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
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      toast.success("تم إنشاء الفعالية بنجاح");
      navigate(`/events/${eventData.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("حدث خطأ أثناء إنشاء الفعالية");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <EventFormFields
        formData={formData}
        setFormData={setFormData}
        onImageChange={handleImageChange}
      />
      <div className="flex justify-start gap-2 mt-6 text-right" dir="rtl">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? "جاري الإنشاء..." : "إنشاء الفعالية"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};
