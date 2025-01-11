import { useQuery } from "@tanstack/react-query";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { DepartmentsList } from "@/components/tasks/DepartmentsList";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentDialog } from "@/components/tasks/dialogs/DepartmentDialog";

const Tasks = () => {
  const { data: departments, isLoading, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      console.log('Fetching departments...');
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }

      console.log('Fetched departments:', data);
      return data || [];
    },
  });

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">إدارة المهام</h1>
            <DepartmentDialog onSuccess={refetch} />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DepartmentsList departments={departments || []} />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tasks;