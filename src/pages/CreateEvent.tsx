import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { EventFormFields } from "@/components/events/EventFormFields";
import { EventFormActions } from "@/components/events/form/EventFormActions";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Event } from "@/store/eventStore";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Event>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image_url: "",
    eventType: "in-person",
    maxAttendees: 0,
    registrationStartDate: "",
    registrationEndDate: "",
    beneficiaryType: "both",
    certificateType: "none",
    eventHours: 0,
    price: "free",
    attendees: 0  // Added the missing required property
  });
  
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      image_url: "",
      event_type: "",
      max_attendees: 0,
      registration_start_date: "",
      registration_end_date: "",
      beneficiary_type: "both",
      certificate_type: "none",
      event_hours: 0,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase.from("events").insert([data]);
      if (error) throw error;
      toast.success("تم إنشاء الفعالية بنجاح");
      navigate("/");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("حدث خطأ أثناء إنشاء الفعالية");
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleImageChange = (file: File) => {
    setIsUploading(true);
    // Handle image upload logic here
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">إنشاء فعالية جديدة</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <EventFormFields 
              formData={formData}
              setFormData={setFormData}
              onImageChange={handleImageChange}
            />
            <EventFormActions 
              isUploading={isUploading}
              onCancel={handleCancel}
            />
          </form>
        </Form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;