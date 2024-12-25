import { Button } from "@/components/ui/button";
import { EventsSection } from "@/components/events/EventsSection";

interface EventsTabsProps {
  events: any[];
  upcomingEvents: any[];
  pastEvents: any[];
  activeTab: "all" | "upcoming" | "past";
  setActiveTab: (tab: "all" | "upcoming" | "past") => void;
}

export const EventsTabs = ({ 
  events, 
  upcomingEvents, 
  pastEvents, 
  activeTab, 
  setActiveTab 
}: EventsTabsProps) => {
  return (
    <div>
      <div className="flex justify-center gap-4 mb-8">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
        >
          جميع الفعاليات
        </Button>
        <Button
          variant={activeTab === "upcoming" ? "default" : "outline"}
          onClick={() => setActiveTab("upcoming")}
        >
          الفعاليات القادمة
        </Button>
        <Button
          variant={activeTab === "past" ? "default" : "outline"}
          onClick={() => setActiveTab("past")}
        >
          الفعاليات السابقة
        </Button>
      </div>

      <EventsSection
        events={activeTab === "all" ? events : activeTab === "upcoming" ? upcomingEvents : pastEvents}
        isPastEvents={activeTab === "past"}
      />
    </div>
  );
};