import { DepartmentProject } from "@/types/department";
import { ProjectCard } from "./ProjectCard";

interface ProjectsListProps {
  projects: DepartmentProject[];
}

export const ProjectsList = ({ projects }: ProjectsListProps) => {
  if (!projects.length) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">لا توجد مشاريع في هذه الإدارة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((departmentProject) => (
        <ProjectCard 
          key={departmentProject.id} 
          project={departmentProject.project}
          tasks={departmentProject.project_tasks || []}
        />
      ))}
    </div>
  );
};