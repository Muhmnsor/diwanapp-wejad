import { useState, useEffect } from "react";
import { Event } from "@/store/eventStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEventForm = (eventId?: string) => {
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

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;
      
      try {
        // Fetch event data
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        // Fetch registration fields - Using maybeSingle() instead of single()
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle();

        if (fieldsError) throw fieldsError;

        console.log('Fetched event data:', eventData);
        console.log('Fetched registration fields:', fieldsData);

        setFormData({
          ...eventData,
          registration_fields: fieldsData ? {
            arabic_name: fieldsData.arabic_name,
            english_name: fieldsData.english_name,
            education_level: fieldsData.education_level,
            birth_date: fieldsData.birth_date,
            national_id: fieldsData.national_id,
            email: fieldsData.email,
            phone: fieldsData.phone,
            gender: fieldsData.gender,
            work_status: fieldsData.work_status,
          } : formData.registration_fields
        });
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error("حدث خطأ أثناء تحميل بيانات الفعالية");
      }
    };

    fetchEventData();
  }, [eventId]);

  return {
    formData,
    setFormData,
    isLoading,
    setIsLoading
  };
};