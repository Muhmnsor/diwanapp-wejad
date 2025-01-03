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
  setActiveTab,
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

  return (
    <div className="container mx-auto px-4 mt-12" dir="rtl">
      <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-6 mb-12 space-y-3 md:space-y-0">
        <Button
          variant={activeTab === "upcoming" ? "default" : "outline"}
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 w-full md:w-auto shadow-sm hover:shadow-md transition-all ${isMobile ? 'justify-center' : ''}`}
          size={isMobile ? "default" : "default"}
          title={isMobile ? "المشاريع القادمة" : undefined}
        >
          {isMobile ? (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              المشاريع القادمة
            </>
          ) : (
            "المشاريع القادمة"
          )}
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 w-full md:w-auto shadow-sm hover:shadow-md transition-all ${isMobile ? 'justify-center' : ''}`}
          size={isMobile ? "default" : "default"}
          title={isMobile ? "جميع المشاريع" : undefined}
        >
          {isMobile ? (
            <>
              <CalendarRange className="h-4 w-4 mr-2" />
              جميع المشاريع
            </>
          ) : (
            "جميع المشاريع"
          )}
        </Button>
        <Button
          variant={activeTab === "past" ? "default" : "outline"}
          onClick={() => setActiveTab("past")}
          className={`flex items-center gap-2 w-full md:w-auto shadow-sm hover:shadow-md transition-all ${isMobile ? 'justify-center' : ''}`}
          size={isMobile ? "default" : "default"}
          title={isMobile ? "المشاريع السابقة" : undefined}
        >
          {isMobile ? (
            <>
              <History className="h-4 w-4 mr-2" />
              المشاريع السابقة
            </>
          ) : (
            "المشاريع السابقة"
          )}
        </Button>
      </div>

      <ProjectsSection
        title={getTitle(activeTab)}
        projects={activeTab === "all" ? projects : activeTab === "upcoming" ? upcomingProjects : pastProjects}
        isPastProjects={activeTab === "past"}
      />
    </div>
  );
};