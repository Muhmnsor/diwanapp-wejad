import { Button } from "@/components/ui/button";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { useEffect } from "react";
import { Calendar, CalendarRange, History } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
interface ProjectTabsProps {
  projects: any[];
  upcomingProjects: any[];
  pastProjects: any[];
  activeTab: "all" | "upcoming" | "past";
  setActiveTab: (tab: "all" | "upcoming" | "past") => void;
}
export const ProjectTabs = ({
  projects,
  upcomingProjects,
  pastProjects,
  activeTab,
  setActiveTab
}: ProjectTabsProps) => {
  const isMobile = useIsMobile();
  useEffect(() => {
    setActiveTab("upcoming");
  }, []);
  const getTitle = (tab: "all" | "upcoming" | "past") => {
    switch (tab) {
      case "all":
        return "جميع المشاريع";
      case "upcoming":
        return "المشاريع القادمة";
      case "past":
        return "المشاريع السابقة";
    }
  };
  return <div dir="rtl" className="container mx-auto mt-12 px-0">
      <div className="relative">
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-muted rounded-lg">
            <Button variant="ghost" onClick={() => setActiveTab("upcoming")} className={`
                relative px-6 py-2 rounded-md transition-all
                ${activeTab === "upcoming" ? 'text-primary-foreground shadow-sm' : 'hover:text-primary hover:bg-transparent'}
              `}>
              <span className={`flex items-center gap-2 relative z-10 ${activeTab === "upcoming" ? 'text-white' : ''}`}>
                <Calendar className="h-4 w-4" />
                {isMobile ? "" : "المشاريع القادمة"}
              </span>
              {activeTab === "upcoming" && <span className="absolute inset-0 bg-primary rounded-md"></span>}
            </Button>

            <Button variant="ghost" onClick={() => setActiveTab("all")} className={`
                relative px-6 py-2 rounded-md transition-all
                ${activeTab === "all" ? 'text-primary-foreground shadow-sm' : 'hover:text-primary hover:bg-transparent'}
              `}>
              <span className={`flex items-center gap-2 relative z-10 ${activeTab === "all" ? 'text-white' : ''}`}>
                <CalendarRange className="h-4 w-4" />
                {isMobile ? "" : "جميع المشاريع"}
              </span>
              {activeTab === "all" && <span className="absolute inset-0 bg-primary rounded-md"></span>}
            </Button>

            <Button variant="ghost" onClick={() => setActiveTab("past")} className={`
                relative px-6 py-2 rounded-md transition-all
                ${activeTab === "past" ? 'text-primary-foreground shadow-sm' : 'hover:text-primary hover:bg-transparent'}
              `}>
              <span className={`flex items-center gap-2 relative z-10 ${activeTab === "past" ? 'text-white' : ''}`}>
                <History className="h-4 w-4" />
                {isMobile ? "" : "المشاريع السابقة"}
              </span>
              {activeTab === "past" && <span className="absolute inset-0 bg-primary rounded-md"></span>}
            </Button>
          </div>
        </div>
      </div>

      <ProjectsSection title={getTitle(activeTab)} projects={activeTab === "all" ? projects : activeTab === "upcoming" ? upcomingProjects : pastProjects} isPastProjects={activeTab === "past"} />
    </div>;
};