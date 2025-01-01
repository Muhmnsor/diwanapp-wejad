import { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectRegistrationFields } from "./fields/ProjectRegistrationFields";
import { ProjectRegistrationButton } from "./components/ProjectRegistrationButton";
import { LoadingState, ErrorState } from "../../events/registration/components/RegistrationFormStates";
import { ProjectRegistrationFormData, ProjectRegistrationFieldsConfig } from "./types/registration";

interface ProjectRegistrationFormProps {
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  formData: ProjectRegistrationFormData;
  setFormData: (data: ProjectRegistrationFormData) => void;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
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
}: ProjectRegistrationFormProps) => {
  console.log('ProjectRegistrationForm - Current form data:', formData);

  const { data: registrationFields, isLoading, error } = useQuery({
    queryKey: ['project-registration-fields'],
    queryFn: async () => {
      console.log('Fetching project registration fields');
      try {
        const { data: projectFields, error: projectFieldsError } = await supabase
          .from('project_registration_fields')
          .select('*')
          .maybeSingle();

        if (projectFieldsError) {
          console.error('Error fetching project registration fields:', projectFieldsError);
          throw projectFieldsError;
        }

        if (!projectFields) {
          console.log('No project registration fields found, using defaults');
          return {
            arabic_name: true,
            email: true,
            phone: true,
            english_name: false,
            education_level: false,
            birth_date: false,
            national_id: false,
            gender: false,
            work_status: false
          } as ProjectRegistrationFieldsConfig;
        }

        console.log('Using configured project registration fields:', projectFields);
        return projectFields as ProjectRegistrationFieldsConfig;
      } catch (error) {
        console.error('Failed to fetch project registration fields:', error);
        toast.error("لم نتمكن من تحميل نموذج التسجيل");
        throw error;
      }
    },
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ProjectRegistrationFields
        registrationFields={registrationFields!}
        projectPrice={projectPrice}
        showPaymentFields={isPaidProject}
        formData={formData}
        setFormData={setFormData}
      />
      
      <ProjectRegistrationButton
        isPaidProject={isPaidProject}
        projectPrice={projectPrice}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};