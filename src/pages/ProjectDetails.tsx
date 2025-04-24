import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { useAuthStore } from "@/store/authStore";
import { ProjectDeleteDialog } from "@/components/projects/details/ProjectDeleteDialog";
import { deleteProject } from "@/components/projects/details/deletion/deleteProject";

const ProjectDetails = () => {
  const [project, setProject] = useState<any>(null);
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
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching project:", fetchError);
          setError("حدث خطأ في جلب بيانات المشروع");
          return;
        }

        if (!data) {
          console.log("No project found with ID:", id);
          setError("المشروع غير موجود");
          return;
        }

        console.log("Fetched project:", data);
        setProject(data);
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

const [showDeleteDialog, setShowDeleteDialog] = useState(false);

const handleDelete = () => {
  setShowDeleteDialog(true);
};

const handleConfirmDelete = async () => {
  try {
    await deleteProject(id);
    navigate("/");
  } catch (error) {
    console.error("Error deleting project:", error);
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
