import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { EventFormFields } from "@/components/events/EventFormFields";
import { EventFormActions } from "@/components/events/form/EventFormActions";
import { useQueryClient } from "@tanstack/react-query";

const CreateProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
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
    event_category: "social"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting project form data:', formData);
    
    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.date,
        end_date: formData.date, // For now, using same date for end
        max_attendees: formData.max_attendees,
        image_url: formData.image_url || formData.imageUrl,
        beneficiary_type: formData.beneficiaryType,
        price: formData.price === "free" ? null : formData.price,
        registration_start_date: formData.registration_start_date || formData.registrationStartDate,
        registration_end_date: formData.registration_end_date || formData.registrationEndDate,
        certificate_type: formData.certificate_type,
        event_path: formData.event_path,
        event_category: formData.event_category
      };

      console.log('Processed project data:', projectData);
      
      const { data: project, error } = await supabase
        .from("projects")
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      console.log('Project created successfully:', project);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      toast.success("تم إنشاء المشروع بنجاح");
      navigate("/");
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("حدث خطأ أثناء إنشاء المشروع");
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
        <h1 className="text-3xl font-bold mb-8">إنشاء مشروع جديد</h1>
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

export default CreateProject;