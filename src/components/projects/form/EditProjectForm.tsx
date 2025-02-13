
import { Project } from "@/types/project";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectFormFields } from "../ProjectFormFields";

interface EditProjectFormProps {
  project: Project;
  projectId: string;
}

export const EditProjectForm = ({ project, projectId }: EditProjectFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Project>(project);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: formData.title,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          image_url: formData.image_url,
          event_type: formData.event_type,
          price: formData.price,
          max_attendees: formData.max_attendees,
          beneficiary_type: formData.beneficiary_type,
          certificate_type: formData.certificate_type,
          event_path: formData.event_path,
          event_category: formData.event_category,
          registration_start_date: formData.registration_start_date,
          registration_end_date: formData.registration_end_date,
          attendance_requirement_type: formData.attendance_requirement_type,
          required_activities_count: formData.required_activities_count,
          required_attendance_percentage: formData.required_attendance_percentage
        })
        .eq('id', projectId);

      if (projectError) throw projectError;

      if (formData.registration_fields) {
        const { error: fieldsError } = await supabase
          .from('project_registration_fields')
          .update({
            arabic_name: formData.registration_fields.arabic_name,
            english_name: formData.registration_fields.english_name,
            education_level: formData.registration_fields.education_level,
            birth_date: formData.registration_fields.birth_date,
            national_id: formData.registration_fields.national_id,
            email: formData.registration_fields.email,
            phone: formData.registration_fields.phone,
            gender: formData.registration_fields.gender,
            work_status: formData.registration_fields.work_status
          })
          .eq('project_id', projectId);

        if (fieldsError) throw fieldsError;
      }

      toast.success("تم تحديث المشروع بنجاح");
      navigate(`/projects/${projectId}`);
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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <ProjectFormFields 
        formData={formData}
        setFormData={setFormData}
      />
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          disabled={isLoading}
        >
          إلغاء
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
};
