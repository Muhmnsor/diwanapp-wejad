import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { ProjectDetailsView } from "@/components/projects/ProjectDetailsView";
import { ProjectDashboard } from "@/components/projects/ProjectDashboard";

const ProjectDetails = () => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const { user } = useAuthStore();

  console.log('ProjectDetails - User:', user);

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
        <div className="bg-gray-50/50">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-white" dir="rtl">
              <TabsTrigger value="details">تفاصيل المشروع</TabsTrigger>
              {isAdmin && <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="details" className="mt-0">
              <ProjectDetailsView project={project} isAdmin={isAdmin} id={id!} />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="dashboard" className="mt-6 px-4 md:px-8">
                <ProjectDashboard projectId={id!} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetails;