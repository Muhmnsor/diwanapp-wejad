
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventsTabContent } from "./tabs/EventsTabContent";

interface EventsTabsProps {
  events: any[];
  upcomingEvents: any[];
  pastEvents: any[];
  activeTab: "all" | "upcoming" | "past";
  setActiveTab: (value: "all" | "upcoming" | "past") => void;
  registrations: Record<string, number>;
}

export const EventsTabs = ({
  events,
  upcomingEvents,
  pastEvents,
  activeTab,
  setActiveTab,
  registrations,
}: EventsTabsProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">الفعاليات</h2>
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <div className="relative">
          <TabsList className="w-full md:w-fit justify-start border-b rounded-none bg-white p-0 h-12">
            <TabsTrigger 
              value="upcoming"
              className="flex-1 md:flex-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 relative data-[state=active]:shadow-none data-[state=active]:bg-transparent h-12"
            >
              القادمة
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="flex-1 md:flex-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 relative data-[state=active]:shadow-none data-[state=active]:bg-transparent h-12"
            >
              الجميع
            </TabsTrigger>
            <TabsTrigger 
              value="past"
              className="flex-1 md:flex-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-8 relative data-[state=active]:shadow-none data-[state=active]:bg-transparent h-12"
            >
              السابقة
            </TabsTrigger>
          </TabsList>
        </div>
        <EventsTabContent 
          events={events}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          activeTab={activeTab}
          registrations={registrations}
        />
      </Tabs>
    </div>
  );
};
