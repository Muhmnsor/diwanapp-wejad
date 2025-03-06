
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  project_id: string | null;
  is_draft?: boolean;
}

interface TaskProjectsListProps {
  workspaceId: string;
}

export const TaskProjectsList = ({ workspaceId }: TaskProjectsListProps) => {
  const queryClient = useQueryClient();
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['task-projects', workspaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleProjectUpdated = () => {
    // Refetch the projects list
    queryClient.invalidateQueries({ queryKey: ['task-projects', workspaceId] });
  };

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

  // Sort projects - draft projects first, then by creation date
  const sortedProjects = [...projects].sort((a, b) => {
    // Draft projects first
    if (a.is_draft && !b.is_draft) return -1;
    if (!a.is_draft && b.is_draft) return 1;
    
    // Then by creation date (newest first)
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {sortedProjects.map((project: TaskProject) => (
        <TaskProjectCard 
          key={project.id} 
          project={project} 
          onProjectUpdated={handleProjectUpdated}
        />
      ))}
    </div>
  );
};
