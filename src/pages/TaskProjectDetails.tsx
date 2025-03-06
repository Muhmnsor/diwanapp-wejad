
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskProjectInfo } from "@/components/tasks/project-details/TaskProjectInfo";
import { TasksList } from "@/components/tasks/project-details/TasksList";

const TaskProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);
  
  const fetchProjectDetails = async () => {
    if (!projectId) return;
    
    try {
      console.log("Fetching task project with ID:", projectId);
      
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error("Error fetching project:", error);
        setError(true);
        return;
      }
      
      if (data) {
        console.log("Project data:", data);
        setProject(data);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);
  
  const handleProjectUpdated = () => {
    fetchProjectDetails();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto" dir="rtl">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium text-gray-600 mb-2">لم يتم العثور على المشروع</h3>
                <p className="text-gray-500">تأكد من الرابط أو عد إلى الصفحة السابقة</p>
              </div>
            ) : (
              <div className="space-y-8">
                <TaskProjectInfo project={project} onProjectUpdated={handleProjectUpdated} />
                <TasksList 
                  projectId={projectId} 
                  isDraftProject={project.is_draft}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TaskProjectDetails;
