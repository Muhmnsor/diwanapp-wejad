import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Project } from "@/types/project";
import { ProjectFormFields } from "@/components/projects/ProjectFormFields";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";

const CreateProject = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Project>({
    id: "",
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    max_attendees: 0,
    image_url: "",
    event_type: "in-person",
    price: null,
    beneficiary_type: "both",
    certificate_type: "none",
    event_path: "environment",
    event_category: "social"
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
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          max_attendees: formData.max_attendees,
          image_url: formData.image_url,
          event_type: formData.event_type,
          price: formData.price,
          beneficiary_type: formData.beneficiary_type,
          certificate_type: formData.certificate_type,
          event_path: formData.event_path,
          event_category: formData.event_category
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success("تم إنشاء المشروع بنجاح");
      navigate(`/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("حدث خطأ أثناء إنشاء المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">إنشاء مشروع جديد</h1>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <ProjectFormFields
              formData={formData}
              setFormData={setFormData}
              onImageChange={handleImageChange}
            />
            <div className="flex justify-start gap-2 mt-6">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? "جاري الإنشاء..." : "إنشاء المشروع"}
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
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;