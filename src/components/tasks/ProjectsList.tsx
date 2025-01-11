import { DepartmentProject } from "@/types/department";
import { TaskProjectCard } from "./ProjectCard";

interface TaskProjectsListProps {
  projects: DepartmentProject[];
}

export const TaskProjectsList = ({ projects }: TaskProjectsListProps) => {
  if (!projects.length) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">لا توجد مشاريع مهام في هذه الإدارة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((departmentProject) => (
        <TaskProjectCard 
          key={departmentProject.id} 
          project={departmentProject.project}
          tasks={departmentProject.project_tasks || []}
        />
      ))}
    </div>
  );
};