import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsSection } from "@/components/events/EventsSection";
import { ProjectsSection } from "@/components/events/ProjectsSection";

interface EventsTabsProps {
  events: any[];
  projects: any[];
  upcomingEvents: any[];
  pastEvents: any[];
  activeTab: "all" | "upcoming" | "past";
  setActiveTab: (tab: "all" | "upcoming" | "past") => void;
  registrations: { [key: string]: number };
}

export const EventsTabs = ({
  events,
  projects,
  upcomingEvents,
  pastEvents,
  activeTab,
  setActiveTab,
  registrations,
}: EventsTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-8">
      <TabsList className="w-full justify-start bg-secondary/20 p-1 rounded-xl">
        <TabsTrigger value="upcoming" className="flex-1 max-w-[200px] data-[state=active]:bg-white">
          الفعاليات القادمة
        </TabsTrigger>
        <TabsTrigger value="past" className="flex-1 max-w-[200px] data-[state=active]:bg-white">
          الفعاليات السابقة
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-8">
        <ProjectsSection
          title="المشاريع المتاحة"
          projects={projects}
          registrations={registrations}
          isPastProjects={false}
        />
        <EventsSection
          title="الفعاليات القادمة"
          events={upcomingEvents}
          registrations={registrations}
          isPastEvents={false}
        />
      </TabsContent>

      <TabsContent value="past" className="space-y-8">
        <ProjectsSection
          title="المشاريع السابقة"
          projects={projects}
          registrations={registrations}
          isPastProjects={true}
        />
        <EventsSection
          title="الفعاليات السابقة"
          events={pastEvents}
          registrations={registrations}
          isPastEvents={true}
        />
      </TabsContent>
    </Tabs>
  );
};