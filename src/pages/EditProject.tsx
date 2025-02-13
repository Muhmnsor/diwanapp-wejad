
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types/project";
import { TopHeader } from "@/components/layout/TopHeader";
import { EditProjectForm } from "@/components/projects/form/EditProjectForm";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

const EditProject = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('project_registration_fields')
          .select('*')
          .eq('project_id', id)
          .maybeSingle();

        if (fieldsError) throw fieldsError;

        if (projectData) {
          setProject({
            ...projectData,
            registration_fields: fieldsData || {
              arabic_name: true,
              email: true,
              phone: true,
              english_name: false,
              education_level: false,
              birth_date: false,
              national_id: false,
              gender: false,
              work_status: false
            }
          });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('حدث خطأ أثناء تحميل بيانات المشروع');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!project) {
    return <div>لم يتم العثور على المشروع</div>;
  }

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">تعديل المشروع</h1>
        <EditProjectForm project={project} projectId={id!} />
      </div>
      <Footer />
    </div>
  );
};

export default EditProject;
