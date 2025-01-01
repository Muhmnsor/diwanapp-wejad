import { Project } from "@/types/project";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectBasicFields } from "./form/fields/ProjectBasicFields";
import { ProjectDatesFields } from "./form/fields/ProjectDatesFields";
import { ProjectTypeFields } from "./form/fields/ProjectTypeFields";
import { ProjectRegistrationFieldsConfig } from "./form/fields/ProjectRegistrationFieldsConfig";
import { Card } from "@/components/ui/card";

interface ProjectFormFieldsProps {
  formData: Project;
  setFormData: (data: Project) => void;
  onImageChange?: (file: File | null) => void;
}

export const ProjectFormFields = ({ formData, setFormData, onImageChange }: ProjectFormFieldsProps) => {
  // Fetch existing registration fields when component mounts
  useEffect(() => {
    const fetchRegistrationFields = async () => {
      if (!formData.id) return;

      const { data, error } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', formData.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching registration fields:', error);
        return;
      }

      if (data) {
        setFormData({
          ...formData,
          registration_fields: {
            arabic_name: data.arabic_name || true,
            email: data.email || true,
            phone: data.phone || true,
            english_name: data.english_name || false,
            education_level: data.education_level || false,
            birth_date: data.birth_date || false,
            national_id: data.national_id || false,
            gender: data.gender || false,
            work_status: data.work_status || false,
          }
        });
      }
    };

    fetchRegistrationFields();
  }, [formData.id]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">معلومات المشروع الأساسية</h2>
        <ProjectBasicFields
          formData={formData}
          setFormData={setFormData}
          onImageChange={onImageChange}
        />
      </Card>

      <ProjectDatesFields
        formData={formData}
        setFormData={setFormData}
      />

      <ProjectTypeFields
        formData={formData}
        setFormData={setFormData}
      />

      <ProjectRegistrationFieldsConfig
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};