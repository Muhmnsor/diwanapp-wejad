import { useEffect, useState } from "react";
import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";
import { ProjectTabs } from "@/components/home/ProjectTabs";
import { useEvents } from "@/hooks/useEvents";
import { useProjects } from "@/hooks/useProjects";
import { useRegistrations } from "@/hooks/useRegistrations";
import { toast } from "sonner";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useAuthStore } from "@/store/authStore";
const Index = () => {
  const [activeEventsTab, setActiveEventsTab] = useState<"all" | "upcoming" | "past">("upcoming");
  const [activeProjectsTab, setActiveProjectsTab] = useState<"all" | "upcoming" | "past">("upcoming");
  const {
    isAuthenticated
  } = useAuthStore();
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

  // فلترة الفعاليات
  const upcomingEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate >= now;
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  const pastEvents = events.filter((event: any) => {
    const eventDate = new Date(event.date);
    return eventDate < now;
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // فلترة المشاريع
  const upcomingProjects = projects.filter((project: any) => {
    const projectEndDate = new Date(project.end_date);
    return projectEndDate >= now;
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.start_date);
    const dateB = new Date(b.start_date);
    return dateA.getTime() - dateB.getTime();
  });
  const pastProjects = projects.filter((project: any) => {
    const projectEndDate = new Date(project.end_date);
    return projectEndDate < now;
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.end_date);
    const dateB = new Date(b.end_date);
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
      upcomingProjectsCount: upcomingProjects.length,
      pastProjectsCount: pastProjects.length,
      isEventsError,
      isProjectsError,
      isRegistrationsError,
      isAuthenticated
    });
  }, [events, projects, registrations, upcomingEvents, pastEvents, upcomingProjects, pastProjects, isEventsError, isProjectsError, isRegistrationsError, eventsError, projectsError, registrationsError, isAuthenticated]);
  return <div className="min-h-screen" dir="rtl">
      <TopHeader />
      <Hero />
      <div className="container mx-auto space-y-12 my-0 px-[15px]">
        <EventsTabs events={events} upcomingEvents={upcomingEvents} pastEvents={pastEvents} activeTab={activeEventsTab} setActiveTab={setActiveEventsTab} registrations={registrations} />
        <ProjectTabs projects={projects} upcomingProjects={upcomingProjects} pastProjects={pastProjects} activeTab={activeProjectsTab} setActiveTab={setActiveProjectsTab} />
      </div>
      <Footer />
    </div>;
};
export default Index;