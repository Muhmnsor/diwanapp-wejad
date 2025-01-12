import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCard } from "./ProjectCard";
import { AsanaSyncSettings } from "./sync/AsanaSyncSettings";

interface DepartmentProjectsProps {
  departmentId: string;
}

export const DepartmentProjects = ({ departmentId }: DepartmentProjectsProps) => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['department-projects', departmentId],
    queryFn: async () => {
      console.log('Fetching projects for department:', departmentId);
      
      const { data, error } = await supabase
        .from('department_projects')
        .select(`
          *,
          projects:project_id (*)
        `)
        .eq('department_id', departmentId);

      if (error) {
        console.error('Error fetching department projects:', error);
        throw error;
      }

      return data;
    }
  });

  if (isLoading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <AsanaSyncSettings departmentId={departmentId} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project.projects}
            asanaGid={project.asana_gid}
          />
        ))}
      </div>
    </div>
  );
};