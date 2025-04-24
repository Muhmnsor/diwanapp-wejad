
// تحديث ملف ProjectFormFields.tsx
import { Project } from "@/types/project";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProjectBasicFields } from "./form/fields/ProjectBasicFields";
import { ProjectDatesFields } from "./form/fields/ProjectDatesFields";
import { ProjectTypeFields } from "./form/fields/ProjectTypeFields";
import { ProjectRegistrationFieldsConfig } from "./form/fields/ProjectRegistrationFieldsConfig";
import { ProjectFormBuilder } from "./ProjectFormBuilder";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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

      console.log('Fetching registration fields for project:', formData.id);

      try {
        const { data, error } = await supabase
          .from('project_registration_fields')
          .select('*')
          .eq('project_id', formData.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching registration fields:', error);
          toast.error("حدث خطأ في تحميل إعدادات حقول التسجيل");
          return;
        }

        // If no data found, use default values
        const registrationFields = data || {
          arabic_name: true,
          email: true,
          phone: true,
          english_name: false,
          education_level: false,
          birth_date: false,
          national_id: false,
          gender: false,
          work_status: false,
        };

        console.log('Retrieved registration fields:', registrationFields);

        setFormData({
          ...formData,
          registration_fields: registrationFields
        });
      } catch (error) {
        console.error('Error in fetchRegistrationFields:', error);
        toast.error("حدث خطأ في تحميل إعدادات حقول التسجيل");
      }
    };

    fetchRegistrationFields();
  }, [formData.id]);

  // Update registration fields in database when they change
  useEffect(() => {
    const updateRegistrationFields = async () => {
      if (!formData.id || !formData.registration_fields) return;

      console.log('Updating registration fields in database:', formData.registration_fields);

      try {
        const { error } = await supabase
          .from('project_registration_fields')
          .upsert({
            project_id: formData.id,
            ...formData.registration_fields
          });

        if (error) {
          console.error('Error updating registration fields:', error);
          toast.error("حدث خطأ في حفظ إعدادات حقول التسجيل");
        }
      } catch (error) {
        console.error('Error in updateRegistrationFields:', error);
        toast.error("حدث خطأ في حفظ إعدادات حقول التسجيل");
      }
    };

    updateRegistrationFields();
  }, [formData.registration_fields]);

  const handleSaveCustomForm = (customForm: any) => {
    setFormData({
      ...formData,
      customForm
    });
  };

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
      
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">حقول مخصصة إضافية</h2>
        <ProjectFormBuilder 
          initialForm={formData.customForm} 
          onSaveForm={handleSaveCustomForm}
        />
      </Card>
    </div>
  );
};
