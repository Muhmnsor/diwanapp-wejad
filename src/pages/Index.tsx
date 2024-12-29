import { useEffect, useState } from "react";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { useEvents } from "@/hooks/useEvents";
import { useProjects } from "@/hooks/useProjects";
import { useRegistrations } from "@/hooks/useRegistrations";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("upcoming");
  const { isAuthenticated } = useAuthStore();
  
  const { 
    data: events = [], 
    isError: isEventsError,
    error: eventsError 
  } = useEvents();
  
  const {
    data: projects = [],
    isError: isProjectsError,
    error: projectsError
  } = useProjects();
  
  const { 
    data: registrations = {}, 
    isError: isRegistrationsError,
    error: registrationsError 
  } = useRegistrations();

  const now = new Date();
  
  const upcomingEvents = events
    .filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  const pastEvents = events
    .filter((event: any) => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

  useEffect(() => {
    if (isEventsError) {
      console.error("❌ خطأ في جلب الفعاليات:", eventsError);
      toast.error("حدث خطأ في تحميل الفعاليات");
    }

    if (isProjectsError) {
      console.error("❌ خطأ في جلب المشاريع:", projectsError);
      toast.error("حدث خطأ في تحميل المشاريع");
    }

    if (isRegistrationsError && isAuthenticated) {
      console.error("❌ خطأ في جلب التسجيلات:", registrationsError);
      toast.error("حدث خطأ في تحميل التسجيلات");
    }

    console.log("📊 حالة البيانات:", {
      eventsCount: events.length,
      projectsCount: projects.length,
      registrationsCount: Object.keys(registrations).length,
      upcomingEventsCount: upcomingEvents.length,
      pastEventsCount: pastEvents.length,
      isEventsError,
      isProjectsError,
      isRegistrationsError,
      isAuthenticated
    });
  }, [
    events, 
    projects,
    registrations, 
    upcomingEvents, 
    pastEvents, 
    isEventsError,
    isProjectsError,
    isRegistrationsError,
    eventsError,
    projectsError,
    registrationsError,
    isAuthenticated
  ]);

  return (
    <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <Hero />
      <div className="container mx-auto px-4 space-y-12">
        <EventsTabs
          events={events}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          registrations={registrations}
        />
        <ProjectsSection
          title="المشاريع"
          projects={projects}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Index;