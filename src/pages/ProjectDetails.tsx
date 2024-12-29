import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventDetailsView } from "@/components/events/EventDetailsView";
import { useAuthStore } from "@/store/authStore";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { toast } from "sonner";

const ProjectDetails = () => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          setError("معرف المشروع غير موجود");
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error("Error fetching project:", fetchError);
          setError("حدث خطأ في جلب بيانات المشروع");
          return;
        }

        if (!data) {
          setError("المشروع غير موجود");
          return;
        }

        // Transform project data to match event structure
        const transformedProject = {
          ...data,
          // Convert Date to string format for consistency
          date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : null,
          time: "00:00", // Default time for projects
          registration_start_date: data.registration_start_date ? new Date(data.registration_start_date).toISOString().split('T')[0] : null,
          registration_end_date: data.registration_end_date ? new Date(data.registration_end_date).toISOString().split('T')[0] : null,
          event_type: data.event_type || "in-person",
          certificate_type: data.certificate_type || "none",
          event_hours: null,
          location_url: null
        };

        console.log("Transformed project data:", transformedProject);
        setProject(transformedProject);
      } catch (err) {
        console.error("Error in fetchProject:", err);
        setError("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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

  const handleEdit = () => {
    console.log("Edit project clicked");
    toast.info("تحت التطوير");
  };

  const handleDelete = async () => {
    console.log("Delete project clicked");
    toast.info("تحت التطوير");
  };

  const handleAddToCalendar = () => {
    console.log("Add to calendar clicked");
    toast.info("تحت التطوير");
  };

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 py-12">
        <EventDetailsView
          event={project}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddToCalendar={handleAddToCalendar}
          id={id!}
        />
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetails;