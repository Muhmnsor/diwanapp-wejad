import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { ProjectFormFields } from "@/components/projects/ProjectFormFields";
import { handleImageUpload } from "@/components/events/form/EventImageUpload";
import { toast } from "sonner";

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("حدث خطأ أثناء تحميل بيانات المشروع");
      }
    };

    fetchProject();
  }, [id]);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    setIsLoading(true);
    try {
      const { publicUrl, error } = await handleImageUpload(file);
      if (error) throw error;
      setProject(prev => prev ? ({ ...prev, image_url: publicUrl }) : null);
      toast.success("تم رفع الصورة بنجاح");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("حدث خطأ أثناء رفع الصورة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!project || !id) return;
    
    setIsLoading(true);
    try {
      // Update project details
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: project.title,
          description: project.description,
          start_date: project.start_date,
          end_date: project.end_date,
          max_attendees: project.max_attendees,
          image_url: project.image_url,
          event_type: project.event_type,
          price: project.price,
          beneficiary_type: project.beneficiary_type,
          certificate_type: project.certificate_type,
          event_path: project.event_path,
          event_category: project.event_category,
          registration_start_date: project.registration_start_date,
          registration_end_date: project.registration_end_date
        })
        .eq('id', id);

      if (projectError) throw projectError;

      // Update registration fields
      const { error: fieldsError } = await supabase
        .from('project_registration_fields')
        .upsert({
          project_id: id,
          arabic_name: project.registration_fields?.arabic_name ?? true,
          email: project.registration_fields?.email ?? true,
          phone: project.registration_fields?.phone ?? true,
          english_name: project.registration_fields?.english_name ?? false,
          education_level: project.registration_fields?.education_level ?? false,
          birth_date: project.registration_fields?.birth_date ?? false,
          national_id: project.registration_fields?.national_id ?? false,
          gender: project.registration_fields?.gender ?? false,
          work_status: project.registration_fields?.work_status ?? false
        });

      if (fieldsError) throw fieldsError;

      toast.success("تم تحديث المشروع بنجاح");
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("حدث خطأ أثناء تحديث المشروع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">جاري التحميل...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-right">تعديل المشروع</h1>
        <ProjectFormFields
          formData={project}
          setFormData={setProject}
          onImageChange={handleImageChange}
        />
        <div className="flex justify-start gap-2 mt-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
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
  );
};

export default EditProject;