import { FormEvent } from "react";
import { ProjectRegistrationFields } from "./fields/ProjectRegistrationFields";
import { ProjectRegistrationButton } from "./components/ProjectRegistrationButton";
import { ProjectRegistrationFormData, ProjectRegistrationFieldsConfig } from "./types/registration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProjectRegistrationFormProps {
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
  registrationFields: ProjectRegistrationFieldsConfig;
}

export const ProjectRegistrationForm = ({
  projectTitle,
  projectPrice,
  startDate,
  endDate,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  registrationFields,
}: ProjectRegistrationFormProps) => {
  console.log('ProjectRegistrationForm - Current form data:', formData);
  const navigate = useNavigate();
  
  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate a unique registration number
      const registrationNumber = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get project ID from URL
      const projectId = window.location.pathname.split('/').pop();
      
      // Insert registration data into the database
      const { data, error } = await supabase
        .from('registrations')
        .insert([
          {
            project_id: projectId,
            registration_number: registrationNumber,
            arabic_name: formData.arabicName,
            english_name: formData.englishName,
            email: formData.email,
            phone: formData.phone,
            education_level: formData.educationLevel,
            birth_date: formData.birthDate,
            national_id: formData.nationalId,
            gender: formData.gender,
            work_status: formData.workStatus
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error submitting registration:', error);
        toast.error('حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.');
        return;
      }

      console.log('Registration submitted successfully:', data);
      toast.success('تم التسجيل بنجاح!');
      
      // Call the original onSubmit handler
      onSubmit(e);
      
      // Navigate to success page or show confirmation
      // You can customize this based on your needs
      navigate(`/projects/${projectId}/registration/success`);
      
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProjectRegistrationFields
        formData={formData}
        setFormData={setFormData}
        projectPrice={projectPrice}
        showPaymentFields={isPaidProject}
        registrationFields={registrationFields}
      />
      
      <ProjectRegistrationButton
        isSubmitting={isSubmitting}
        isPaidProject={isPaidProject}
        projectPrice={projectPrice}
      />
    </form>
  );
};