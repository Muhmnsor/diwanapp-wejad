import { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";

interface ProjectsListProps {
  projects: Project[];
}

export const ProjectsList = ({ projects }: ProjectsListProps) => {
  if (!projects.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد مشاريع متاحة حالياً
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};