
import { Card, CardContent } from "@/components/ui/card";
import { CreateEventForm } from "./CreateEventForm";
import { useState } from "react";
import { EventType } from "@/types/event";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CreateEventFormContainer = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<EventType>({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    location_url: "",
    attendees: 0,
    max_attendees: 0,
    event_type: "online",
    price: "free",
    beneficiary_type: "both",
    registration_start_date: null,
    registration_end_date: null,
    certificate_type: "",
    event_hours: null,
    event_path: "environment",
    event_category: "social",
  });

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        image_url: publicUrl
      }));

      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('events')
        .insert([formData]);

      if (error) throw error;

      toast.success("تم إنشاء الفعالية بنجاح");
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("حدث خطأ أثناء إنشاء الفعالية");
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">المعلومات الأساسية</h2>
          <CreateEventForm 
            formData={formData}
            setFormData={setFormData}
            onImageChange={handleImageChange}
            onSubmit={handleSubmit}
            isUploading={isUploading}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
};
