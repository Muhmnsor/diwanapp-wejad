import { useNavigate, useParams } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventFormFields } from "@/components/events/EventFormFields";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Event } from "@/store/eventStore";
import { EventFormActions } from "@/components/events/form/EventFormActions";
import { useQueryClient } from "@tanstack/react-query";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
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
    // Default values for registration fields
    arabic_name: false,
    english_name: false,
    education_level: false,
    birth_date: false,
    national_id: false,
    email: true,
    phone: true
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      try {
        console.log('Fetching event data for editing, ID:', id);
        const [eventResult, fieldsResult] = await Promise.all([
          supabase.from("events").select("*").eq("id", id).single(),
          supabase.from("event_registration_fields").select("*").eq("event_id", id).single()
        ]);

        if (eventResult.error) throw eventResult.error;

        console.log('Fetched event data:', eventResult.data);
        console.log('Fetched registration fields:', fieldsResult.data);
        
        if (eventResult.data) {
          setFormData({
            ...eventResult.data,
            ...fieldsResult.data,
            title: eventResult.data.title || "",
            description: eventResult.data.description || "",
            date: eventResult.data.date || "",
            time: eventResult.data.time || "",
            location: eventResult.data.location || "",
            certificate_type: eventResult.data.certificate_type || "none",
            certificateType: eventResult.data.certificate_type || "none",
            event_hours: eventResult.data.event_hours || 0,
            eventHours: eventResult.data.event_hours || 0,
            price: eventResult.data.price || "free",
            max_attendees: eventResult.data.max_attendees || 0,
            beneficiaryType: eventResult.data.beneficiary_type || "both",
            event_type: eventResult.data.event_type || "in-person",
            eventType: eventResult.data.event_type || "in-person",
            attendees: 0,
            imageUrl: eventResult.data.image_url || "",
            image_url: eventResult.data.image_url || "",
            registrationStartDate: eventResult.data.registration_start_date || "",
            registrationEndDate: eventResult.data.registration_end_date || "",
            registration_start_date: eventResult.data.registration_start_date || "",
            registration_end_date: eventResult.data.registration_end_date || "",
            event_path: eventResult.data.event_path || "environment",
            event_category: eventResult.data.event_category || "social",
            // Registration fields with defaults if not found
            arabic_name: fieldsResult.data?.arabic_name ?? false,
            english_name: fieldsResult.data?.english_name ?? false,
            education_level: fieldsResult.data?.education_level ?? false,
            birth_date: fieldsResult.data?.birth_date ?? false,
            national_id: fieldsResult.data?.national_id ?? false,
            email: fieldsResult.data?.email ?? true,
            phone: fieldsResult.data?.phone ?? true
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error("حدث خطأ أثناء جلب بيانات الفعالية");
      }
    };

    fetchEvent();
  }, [id]);

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

      let eventId = id;
      
      if (isEditMode) {
        console.log('Updating event with ID:', id);
        const { error: eventError } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", id);

        if (eventError) throw eventError;

        const { error: fieldsError } = await supabase
          .from("event_registration_fields")
          .upsert({
            ...registrationFieldsData,
            event_id: id
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
        
        eventId = newEvent.id;

        const { error: fieldsError } = await supabase
          .from("event_registration_fields")
          .insert([{
            ...registrationFieldsData,
            event_id: eventId
          }]);

        if (fieldsError) throw fieldsError;
      }

      await queryClient.invalidateQueries({ queryKey: ["events"] });

      toast.success(isEditMode ? "تم تحديث الفعالية بنجاح" : "تم إنشاء الفعالية بنجاح");
      navigate("/");
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(isEditMode ? "حدث خطأ أثناء تحديث الفعالية" : "حدث خطأ أثناء إنشاء الفعالية");
    }
  };

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

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {isEditMode ? "تعديل الفعالية" : "إنشاء فعالية جديدة"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EventFormFields 
            formData={formData} 
            setFormData={setFormData}
            onImageChange={handleImageChange}
          />
          <EventFormActions 
            isUploading={isUploading}
            onCancel={() => navigate("/")}
          />
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;