import { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProjectRegistrationFields } from "./fields/ProjectRegistrationFields";
import { ProjectRegistrationButton } from "./components/ProjectRegistrationButton";
import { LoadingState, ErrorState } from "../../events/registration/components/RegistrationFormStates";
import { useRegistration } from "../../events/registration/hooks/useRegistration";

interface ProjectRegistrationFormProps {
  projectId: string;
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  onSubmit: (e: FormEvent) => void;
}

export const ProjectRegistrationForm = ({
  projectId,
  projectTitle,
  projectPrice,
  startDate,
  endDate,
  onSubmit,
}: ProjectRegistrationFormProps) => {
  const { formData, setFormData, isSubmitting } = useRegistration(() => {}, true);

  const { data: registrationFields, isLoading, error } = useQuery({
    queryKey: ['project-registration-fields', projectId],
    queryFn: async () => {
      console.log('Fetching project registration fields for:', projectId);
      try {
        const { data: projectFields, error: projectFieldsError } = await supabase
          .from('project_registration_fields')
          .select('*')
          .eq('project_id', projectId)
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
          };
        }

        const fields = {
          arabic_name: Boolean(projectFields.arabic_name),
          email: Boolean(projectFields.email),
          phone: Boolean(projectFields.phone),
          english_name: Boolean(projectFields.english_name),
          education_level: Boolean(projectFields.education_level),
          birth_date: Boolean(projectFields.birth_date),
          national_id: Boolean(projectFields.national_id),
          gender: Boolean(projectFields.gender),
          work_status: Boolean(projectFields.work_status)
        };

        console.log('Using configured project registration fields:', fields);
        return fields;
      } catch (error) {
        console.error('Failed to fetch project registration fields:', error);
        toast.error('حدث خطأ في تحميل نموذج التسجيل');
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const isPaidProject = projectPrice !== "free" && projectPrice !== null && projectPrice > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <ProjectRegistrationFields
        registrationFields={registrationFields}
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