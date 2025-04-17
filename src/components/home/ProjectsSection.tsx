import { ProjectCard } from "@/components/projects/ProjectCard";
import { useAuthStore } from "@/store/authStore";
import { History, Rocket } from "lucide-react";
interface ProjectsSectionProps {
  title: string;
  projects: any[];
  isPastProjects?: boolean;
}
export const ProjectsSection = ({
  title,
  projects,
  isPastProjects = false
}: ProjectsSectionProps) => {
  const {
    user
  } = useAuthStore();
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
    return <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm">
        <div className={`border-r-4 ${isPastProjects ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
          <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
          {isPastProjects && <History className="w-6 h-6 text-[#9F9EA1]" />}
        </div>
        <div className="text-center text-[#9F9EA1] p-8 bg-[#F5F5F7] dark:bg-[#2A2F3C] rounded-2xl backdrop-blur-sm">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-primary animate-bounce" />
          <p className="text-lg mb-2">
            {isPastProjects ? "لم تتم إضافة أي مشاريع سابقة بعد" : "لا توجد مشاريع حالية، ولكن هناك المزيد قادم!"}
          </p>
          <p className="text-sm opacity-75">
            {isPastProjects ? "تابعنا لمشاهدة أرشيف المشاريع السابقة" : "ترقبوا مشاريعنا القادمة المميزة"}
          </p>
        </div>
      </section>;
  }
  return <section className="rounded-2xl bg-gradient-to-b from-[#F5F5F7] to-white dark:from-[#2A2F3C] dark:to-[#1A1F2C] p-8 shadow-sm px-[11px]">
      <div className={`border-r-4 ${isPastProjects ? 'border-[#9F9EA1]' : 'border-primary'} pr-4 mb-8 flex items-center gap-2`}>
        <h2 className="text-3xl font-bold text-[#403E43] dark:text-white">{title}</h2>
        {isPastProjects && <History className="w-6 h-6 text-[#9F9EA1]" />}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {visibleProjects.map(project => <div key={project.id} className="flex justify-center">
            <ProjectCard {...project} className={!project.is_visible ? "opacity-50" : ""} />
          </div>)}
      </div>
    </section>;
};