import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AsanaSyncSettings } from "./sync/AsanaSyncSettings";
import { toast } from "sonner";

interface DepartmentProjectsProps {
  departmentId: string;
}

export const DepartmentProjects = ({ departmentId }: DepartmentProjectsProps) => {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['department-projects', departmentId],
    queryFn: async () => {
      console.log('Fetching projects for department:', departmentId);
      
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('id', departmentId)
        .single();

      if (deptError) {
        console.error('Error fetching department:', deptError);
        toast.error('حدث خطأ في جلب بيانات الإدارة');
        throw deptError;
      }

      console.log('Department data:', department);

      const { data, error } = await supabase
        .from('department_projects')
        .select(`
          id,
          asana_gid,
          projects:project_id (
            id,
            title,
            description,
            start_date,
            end_date,
            image_url,
            event_type,
            price,
            max_attendees,
            registration_start_date,
            registration_end_date,
            beneficiary_type,
            certificate_type,
            event_path,
            event_category,
            is_visible
          )
        `)
        .eq('department_id', departmentId);

      if (error) {
        console.error('Error fetching department projects:', error);
        toast.error('حدث خطأ في جلب المشاريع');
        throw error;
      }

      console.log('Department projects:', data);
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
        {projects.map((project) => {
          if (!project.projects) return null;
          
          const projectData = project.projects;
          return (
            <ProjectCard
              key={project.id}
              id={projectData.id}
              title={projectData.title}
              start_date={projectData.start_date}
              end_date={projectData.end_date}
              image_url={projectData.image_url}
              event_type={projectData.event_type}
              price={projectData.price}
              max_attendees={projectData.max_attendees}
              registration_start_date={projectData.registration_start_date}
              registration_end_date={projectData.registration_end_date}
              beneficiary_type={projectData.beneficiary_type}
              certificate_type={projectData.certificate_type}
              event_path={projectData.event_path}
              event_category={projectData.event_category}
              is_visible={projectData.is_visible}
            />
          );
        })}
      </div>
    </div>
  );
};