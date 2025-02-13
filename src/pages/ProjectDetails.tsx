import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { useAuthStore } from "@/store/authStore";
import { Project } from "@/types/project";
import { EventType, BeneficiaryType, EventPathType, EventCategoryType } from "@/types/event";

const ProjectDetails = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          setError("معرف المشروع غير موجود");
          return;
        }

        console.log("Fetching project with ID:", id);
        const { data: projectData, error: fetchError } = await supabase
          .from("projects")
          .select(`
            *,
            events (*)
          `)
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Error fetching project:", fetchError);
          setError("حدث خطأ في جلب بيانات المشروع");
          return;
        }

        if (!projectData) {
          console.log("No project found with ID:", id);
          setError("المشروع غير موجود");
          return;
        }

        // Cast the data to match Project type
        const typedProject: Project = {
          ...projectData,
          event_type: projectData.event_type as EventType,
          beneficiary_type: projectData.beneficiary_type as BeneficiaryType,
          event_path: projectData.event_path as EventPathType,
          event_category: projectData.event_category as EventCategoryType,
        };

        console.log("Fetched project:", typedProject);
        setProject(typedProject);
      } catch (err) {
        console.error("Error in fetchProject:", err);
        setError("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleEdit = () => {
    console.log("Edit project clicked, navigating to edit page");
    navigate(`/projects/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.");
    if (!confirmed) return;

    try {
      // First, delete related project events
      const { error: eventsError } = await supabase
        .from("events")
        .delete()
        .eq("project_id", id);

      if (eventsError) {
        console.error("Error deleting project events:", eventsError);
        throw eventsError;
      }

      // Then, delete related registrations
      const { error: registrationsError } = await supabase
        .from("registrations")
        .delete()
        .eq("project_id", id);

      if (registrationsError) {
        console.error("Error deleting project registrations:", registrationsError);
        throw registrationsError;
      }

      // Finally, delete the project
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (projectError) throw projectError;

      toast.success("تم حذف المشروع بنجاح");
      navigate("/");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("حدث خطأ أثناء حذف المشروع");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = user?.isAdmin;

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 py-12">
        <ProjectDetailsView
          project={project}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          id={id}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetails;
