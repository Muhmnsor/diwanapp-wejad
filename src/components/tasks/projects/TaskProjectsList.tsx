
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
  project_manager?: string | null;
  project_manager_name?: string | null;
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
      console.log(`Fetching projects for workspace ${workspaceId}`);
      
      // Fetch projects without trying to join directly which may be causing the issue
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} projects`, data);
      
      // If we have project managers, get their names in a separate query
      const projectsWithManagers = [...(data || [])];
      const managerIds = data
        ?.map(project => project.project_manager)
        .filter(Boolean) as string[];
      
      if (managerIds && managerIds.length > 0) {
        // Get unique manager IDs
        const uniqueManagerIds = [...new Set(managerIds)];
        
        const { data: managers, error: managersError } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', uniqueManagerIds);
        
        if (!managersError && managers && managers.length > 0) {
          // Create a mapping of manager IDs to names
          const managerMap = managers.reduce((map: Record<string, string>, manager) => {
            map[manager.id] = manager.display_name || manager.email || 'غير محدد';
            return map;
          }, {});
          
          // Add manager names to projects
          for (let i = 0; i < projectsWithManagers.length; i++) {
            const project = projectsWithManagers[i];
            if (project.project_manager && managerMap[project.project_manager]) {
              projectsWithManagers[i] = {
                ...project,
                project_manager_name: managerMap[project.project_manager]
              };
            }
          }
        }
      }
      
      return projectsWithManagers;
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

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project: TaskProject) => (
        <TaskProjectCard 
          key={project.id} 
          project={project} 
          onProjectUpdated={handleProjectUpdated}
        />
      ))}
    </div>
  );
};
