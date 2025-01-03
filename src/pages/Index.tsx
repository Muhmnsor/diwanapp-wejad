import { Banner } from "@/components/home/Banner";
import { EventsSection } from "@/components/events/EventsSection";
import { useEvents } from "@/hooks/useEvents";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { ProjectTabs } from "@/components/home/ProjectTabs";
import { useProjects } from "@/hooks/useProjects";
import { Hero } from "@/components/home/Hero";

export default function Index() {
  const { data: events, isLoading } = useEvents();
  const { data: projects } = useProjects();

  // تقسيم الفعاليات إلى قادمة وسابقة
  const currentDate = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.date) >= currentDate) || [];
  const pastEvents = events?.filter(event => new Date(event.date) < currentDate) || [];

  // تقسيم المشاريع إلى قادمة وسابقة
  const upcomingProjects = projects?.filter(project => new Date(project.end_date) >= currentDate) || [];
  const pastProjects = projects?.filter(project => new Date(project.end_date) < currentDate) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      
      <main className="flex-grow">
        <Banner />
        <Hero />
        
        <div className="container mx-auto px-4 space-y-16 py-16">
          <EventsSection 
            title="الفعاليات القادمة" 
            events={upcomingEvents}
            registrations={{}}
          />

          <EventsSection 
            title="الفعاليات السابقة" 
            events={pastEvents}
            registrations={{}}
            isPastEvents
          />

          <ProjectTabs
            projects={projects || []}
            upcomingProjects={upcomingProjects}
            pastProjects={pastProjects}
            activeTab="upcoming"
            setActiveTab={() => {}}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}