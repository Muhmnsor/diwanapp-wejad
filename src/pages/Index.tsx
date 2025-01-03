import { Hero } from "@/components/home/Hero";
import { EventsTabs } from "@/components/home/EventsTabs";
import { ProjectsSection } from "@/components/home/ProjectsSection";

export default function Index() {
  return (
    <div className="min-h-screen space-y-16 pb-16">
      <Hero />
      
      <div className="container mx-auto px-4 space-y-16">
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">الفعاليات والأنشطة</h2>
          <EventsTabs />
        </section>

        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">المشاريع</h2>
          <ProjectsSection />
        </section>
      </div>
    </div>
  );
}