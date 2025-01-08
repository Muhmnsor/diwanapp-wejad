import { FormEvent } from "react";
import { ProjectRegistrationForm } from "../ProjectRegistrationForm";
import { useRegistration } from "@/components/events/registration/hooks/useRegistration";
import { useRegistrationFields } from "@/hooks/useRegistrationFields";
import { useParams } from "react-router-dom";

interface ProjectFormContainerProps {
  projectTitle: string;
  projectPrice: number | "free" | null;
  startDate: string;
  endDate: string;
  onSubmit: () => void;
}

export const ProjectFormContainer = ({
  projectTitle,
  projectPrice,
  startDate,
  endDate,
  onSubmit
}: ProjectFormContainerProps) => {
  const { id } = useParams();
  console.log('ProjectFormContainer - Project ID:', id);

  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit: submitRegistration
  } = useRegistration(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, true);

  const { data: registrationFields, isLoading, error } = useRegistrationFields(id);

  if (isLoading) {
    return <div className="p-4 text-center">جاري التحميل...</div>;
  }

  if (error) {
    console.error('Error loading registration fields:', error);
    return <div className="p-4 text-center text-red-500">حدث خطأ في تحميل النموذج</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitRegistration(e);
  };

  return (
    <ProjectRegistrationForm
      projectTitle={projectTitle}
      projectPrice={projectPrice}
      startDate={startDate}
      endDate={endDate}
      formData={formData}
      setFormData={setFormData}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      registrationFields={registrationFields || {
        arabic_name: true,
        email: true,
        phone: true,
        english_name: false,
        education_level: false,
        birth_date: false,
        national_id: false,
        gender: false,
        work_status: false
      }}
    />
  );
};