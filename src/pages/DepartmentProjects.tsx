import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsList } from "@/components/tasks/ProjectsList";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const DepartmentProjects = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: department, isLoading } = useQuery({
    queryKey: ['department', id],
    queryFn: async () => {
      console.log('Fetching department details...', id);
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          department_projects (
            id,
            project: projects (
              *,
              project_tasks (
                *,
                task_subtasks (*)
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching department:', error);
        throw error;
      }

      console.log('Fetched department:', data);
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/tasks')}
            >
              <ChevronRight className="h-4 w-4" />
              العودة إلى الإدارات
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : department ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">{department.name}</h1>
                {department.description && (
                  <p className="text-gray-600 mt-2">{department.description}</p>
                )}
              </div>
              <ProjectsList projects={department.department_projects || []} />
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">لم يتم العثور على الإدارة</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DepartmentProjects;