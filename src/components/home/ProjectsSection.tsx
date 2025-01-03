import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { Loader2 } from "lucide-react";

export const ProjectsSection = () => {
  const { data: projects, isLoading } = useProjects();

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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};