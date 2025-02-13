
import { FormEvent } from "react";
import { ProjectRegistrationFields } from "../fields/ProjectRegistrationFields";
import { ProjectRegistrationButton } from "../components/ProjectRegistrationButton";
import { ProjectRegistrationFormData } from "../types/registration";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProjectRegistrationFormProps {
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  isSubmitting: boolean;
  projectPrice: number | "free" | null;
  registrationFields: {
    arabic_name: boolean;
    email: boolean;
    phone: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
  onSubmit: (e: FormEvent) => void;
}

export const ProjectRegistrationForm = ({
  formData,
  setFormData,
  isSubmitting,
  projectPrice,
  registrationFields,
  onSubmit
}: ProjectRegistrationFormProps) => {
  console.log('ProjectRegistrationForm - Current form data:', formData);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // التحقق من آخر رقم تسجيل تم استخدامه
      const { data: lastRegistration, error: countError } = await supabase
        .from('registrations')
        .select('registration_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (countError) {
        console.error('Error getting last registration number:', countError);
        throw countError;
      }

      // إنشاء رقم تسجيل جديد
      let newRegNumber = 1;
      if (lastRegistration && lastRegistration.length > 0) {
        const lastNumber = parseInt(lastRegistration[0].registration_number.split('-')[1]);
        if (!isNaN(lastNumber)) {
          newRegNumber = lastNumber + 1;
        }
      }
      
      // تنسيق رقم التسجيل بشكل موحد (مثال: REG-001)
      const registrationNumber = `REG-${newRegNumber.toString().padStart(3, '0')}`;
      
      // Get project ID from URL
      const projectId = window.location.pathname.split('/').pop();
      
      // Format birth date properly if it exists
      const birthDate = formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : null;

      // Prepare registration data
      const registrationData = {
        project_id: projectId,
        registration_number: registrationNumber,
        arabic_name: formData.arabicName,
        english_name: formData.englishName || null,
        email: formData.email,
        phone: formData.phone,
        education_level: formData.educationLevel || null,
        birth_date: birthDate,
        national_id: formData.nationalId || null,
        gender: formData.gender || null,
        work_status: formData.workStatus || null
      };

      console.log('Registration data being sent:', registrationData);

      // Insert registration data into the database
      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating registration:', error);
        toast.error('حدث خطأ أثناء التسجيل');
        throw error;
      }

      console.log('Registration created successfully:', data);
      toast.success('تم التسجيل بنجاح');
      onSubmit(e);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    }
  };

  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProjectRegistrationFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
        projectPrice={projectPrice}
        showPaymentFields={isPaidProject}
      />
      
      <ProjectRegistrationButton
        isSubmitting={isSubmitting}
        isPaidProject={isPaidProject}
        projectPrice={projectPrice}
      />
    </form>
  );
};
