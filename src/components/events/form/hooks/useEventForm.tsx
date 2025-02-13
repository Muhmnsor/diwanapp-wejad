
import { useState, useEffect } from "react";
import { Event, EventType, BeneficiaryType, EventPathType, EventCategoryType } from "@/types/event";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEventForm = (eventId?: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Event>({
    id: eventId || crypto.randomUUID(), // Generate a random ID if none provided
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image_url: "",
    attendees: 0,
    max_attendees: 0,
    event_type: "in-person" as EventType,
    price: null,
    beneficiary_type: "both" as BeneficiaryType,
    registration_start_date: null,
    registration_end_date: null,
    certificate_type: "none",
    event_hours: null,
    event_path: "environment" as EventPathType,
    event_category: "social" as EventCategoryType,
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
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (eventError) throw eventError;

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle();

        if (fieldsError) throw fieldsError;

        if (eventData) {
          setFormData({
            ...formData,
            ...eventData,
            event_type: eventData.event_type as EventType,
            beneficiary_type: eventData.beneficiary_type as BeneficiaryType,
            event_path: eventData.event_path as EventPathType,
            event_category: eventData.event_category as EventCategoryType,
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
        }
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
