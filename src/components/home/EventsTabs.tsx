import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsSection } from "@/components/events/EventsSection";
import { useProjects } from "@/hooks/useProjects";

interface EventsTabsProps {
  events: any[];
  upcomingEvents: any[];
  pastEvents: any[];
  activeTab: "all" | "upcoming" | "past";
  setActiveTab: (tab: "all" | "upcoming" | "past") => void;
  registrations: { [key: string]: number };
}

export const EventsTabs = ({
  events,
  upcomingEvents,
  pastEvents,
  activeTab,
  setActiveTab,
  registrations,
}: EventsTabsProps) => {
  const { data: projects = [] } = useProjects();

  console.log('EventsTabs rendering:', { 
    totalEvents: events.length,
    upcomingCount: upcomingEvents.length,
    pastCount: pastEvents.length,
    projectsCount: projects.length,
    activeTab 
  });

  return (
    <Tabs defaultValue={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
      <div className="flex justify-center mb-8">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="past">السابقة</TabsTrigger>
          <TabsTrigger value="all">الكل</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="all" className="space-y-8">
        <EventsSection
          title="المشاريع"
          events={projects}
          registrations={registrations}
          isProjects={true}
        />
        <EventsSection
          title="الفعاليات القادمة"
          events={upcomingEvents}
          registrations={registrations}
        />
        <EventsSection
          title="الفعاليات السابقة"
          events={pastEvents}
          registrations={registrations}
          isPastEvents={true}
        />
      </TabsContent>

      <TabsContent value="upcoming" className="space-y-8">
        <EventsSection
          title="المشاريع"
          events={projects}
          registrations={registrations}
          isProjects={true}
        />
        <EventsSection
          title="الفعاليات القادمة"
          events={upcomingEvents}
          registrations={registrations}
        />
      </TabsContent>

      <TabsContent value="past">
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