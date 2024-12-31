import { ProjectPersonalInfoFields } from "./ProjectPersonalInfoFields";
import { ProjectEducationFields } from "./ProjectEducationFields";
import { PaymentFields } from "@/components/events/form/PaymentFields";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

interface ProjectRegistrationFieldsProps {
  formData: {
    email: string;
    phone: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    arabicName: string;
    englishName: string;
    educationLevel: string;
    birthDate: string;
    nationalId: string;
  };
  setFormData: (data: any) => void;
  projectPrice: number | "free" | null;
}

export const ProjectRegistrationFields = ({
  formData,
  setFormData,
  projectPrice
}: ProjectRegistrationFieldsProps) => {
  const { id } = useParams();
  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  // Fetch registration field settings
  const { data: registrationFields } = useQuery({
    queryKey: ['project-registration-fields', id],
    queryFn: async () => {
      console.log('Fetching registration fields for project:', id);
      const { data, error } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching registration fields:', error);
        throw error;
      }

      console.log('Fetched registration fields:', data);
      // If no fields are found, return default values
      return data || {
        arabic_name: true,
        english_name: false,
        education_level: false,
        birth_date: false,
        national_id: false,
        email: true,
        phone: true,
        gender: false,
        work_status: false
      };
    },
  });

  if (!registrationFields) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ProjectPersonalInfoFields
        formData={formData}
        setFormData={setFormData}
        showEnglishName={registrationFields.english_name}
      />
      
      {(registrationFields.education_level || 
        registrationFields.birth_date || 
        registrationFields.national_id) && (
        <ProjectEducationFields
          formData={formData}
          setFormData={setFormData}
          showEducationLevel={registrationFields.education_level}
          showBirthDate={registrationFields.birth_date}
          showNationalId={registrationFields.national_id}
        />
      )}
      
      {isPaidProject && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={projectPrice}
        />
      )}
    </div>
  );
};