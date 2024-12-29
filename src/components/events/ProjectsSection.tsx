import { ProjectCard } from "@/components/ProjectCard";
import { History } from "lucide-react";

interface ProjectsSectionProps {
  title: string;
  projects: any[];
  registrations: { [key: string]: number };
  isPastProjects?: boolean;
}

export const ProjectsSection = ({ title, projects, registrations, isPastProjects = false }: ProjectsSectionProps) => {
  if (projects.length === 0) {
    return (
      <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
        <div className={`border-r-4 ${isPastProjects ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
          <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
          {isPastProjects && <History className="w-6 h-6 text-[#9F9EA1]" />}
        </div>
        <div className="text-center text-[#9F9EA1] p-8 bg-[#F5F5F7] dark:bg-[#2A2F3C] rounded-2xl backdrop-blur-sm">
          {isPastProjects ? 'لا توجد مشاريع سابقة' : 'لا توجد مشاريع متاحة حالياً'}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
      <div className={`border-r-4 ${isPastProjects ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
        <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
        {isPastProjects && <History className="w-6 h-6 text-[#9F9EA1]" />}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {projects.map((project) => (
          <div key={project.id} className={`flex justify-center ${isPastProjects ? 'opacity-75' : ''}`}>
            <ProjectCard 
              {...project}
              attendees={registrations[project.id] || 0}
            />
          </div>
        ))}
      </div>
    </section>
  );
};