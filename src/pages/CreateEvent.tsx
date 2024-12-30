import { useNavigate, useParams } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { CreateEventForm } from "@/components/events/form/CreateEventForm";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Event } from "@/store/eventStore";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [initialData, setInitialData] = useState<Event | null>(null);

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
          setInitialData({
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

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {isEditMode ? "تعديل الفعالية" : "إنشاء فعالية جديدة"}
        </h1>
        <CreateEventForm
          initialData={initialData || undefined}
          onSuccess={() => navigate("/")}
          onCancel={() => navigate("/")}
          isEditMode={isEditMode}
        />
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;