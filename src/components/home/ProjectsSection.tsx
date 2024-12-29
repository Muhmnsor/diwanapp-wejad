import { ProjectCard } from "@/components/projects/ProjectCard";
import { useAuthStore } from "@/store/authStore";

interface ProjectsSectionProps {
  title: string;
  projects: any[];
}

export const ProjectsSection = ({ title, projects }: ProjectsSectionProps) => {
  const { user } = useAuthStore();
  console.log('ProjectsSection - User:', user);
  console.log('ProjectsSection - Projects:', projects);

  // فلترة المشاريع بناءً على الصلاحيات
  const visibleProjects = projects.filter(project => {
    // إذا كان المستخدم مشرف، اعرض جميع المشاريع
    if (user?.isAdmin) {
      return true;
    }
    // للمستخدمين العاديين، اعرض فقط المشاريع المرئية
    return project.is_visible !== false;
  });

  console.log('ProjectsSection - Filtered Projects:', visibleProjects);

  if (visibleProjects.length === 0) {
    return (
      <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
        <div className="border-r-4 border-primary pr-4 mb-8">
          <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
        </div>
        <div className="text-center text-[#9F9EA1] p-8 bg-[#F5F5F7] dark:bg-[#2A2F3C] rounded-2xl backdrop-blur-sm">
          لا توجد مشاريع حالياً
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
      <div className="border-r-4 border-primary pr-4 mb-8">
        <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {visibleProjects.map((project) => (
          <div key={project.id} className="flex justify-center">
            <ProjectCard 
              {...project} 
              className={!project.is_visible ? "opacity-50" : ""}
            />
          </div>
        ))}
      </div>
    </section>
  );
};