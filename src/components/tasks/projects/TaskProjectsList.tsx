
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskProjectCard } from "./TaskProjectCard";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  workspace_id: string;
  project_id: string;
  projects: {
    title: string;
    description: string | null;
  }
}

interface TaskProjectsListProps {
  workspaceId: string;
}

export const TaskProjectsList = ({ workspaceId }: TaskProjectsListProps) => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['task-projects', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*, projects:project_id(title, description)')
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-medium text-gray-500">لا توجد مشاريع</h3>
        <p className="text-sm text-gray-400 mt-2">قم بإنشاء مشروع جديد للبدء في إدارة المهام</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project: TaskProject) => (
        <TaskProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
