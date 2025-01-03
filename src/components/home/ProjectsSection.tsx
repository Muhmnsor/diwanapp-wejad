import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { Loader2 } from "lucide-react";
import { Project } from "@/types/project";

interface ProjectsSectionProps {
  title?: string;
  projects?: Project[];
  isPastProjects?: boolean;
}

export const ProjectsSection = ({ 
  title = "المشاريع",
  projects: propProjects,
  isPastProjects = false 
}: ProjectsSectionProps) => {
  const { data: fetchedProjects, isLoading } = useProjects();
  const projects = propProjects || fetchedProjects;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        لا توجد مشاريع حالياً
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in" dir="rtl">
      {projects.map((project: Project) => (
        <div key={project.id} className="flex justify-center">
          <ProjectCard {...project} />
        </div>
      ))}
    </div>
  );
};