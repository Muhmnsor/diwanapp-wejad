import { Button } from "@/components/ui/button";
import { EventsSection } from "@/components/events/EventsSection";
import { useEffect } from "react";
import { Calendar, CalendarRange, History } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  registrations 
}: EventsTabsProps) => {
  const isMobile = useIsMobile();

  // Set upcoming events as default tab on component mount
  useEffect(() => {
    setActiveTab("upcoming");
  }, []);

  const getTitle = (tab: "all" | "upcoming" | "past") => {
    switch (tab) {
      case "all":
        return "جميع الفعاليات";
      case "upcoming":
        return "الفعاليات القادمة";
      case "past":
        return "الفعاليات السابقة";
    }
  };

  return (
    <div className="container mx-auto px-4" dir="rtl">
      <div className="flex justify-center gap-2 md:gap-4 mb-8">
        <Button
          variant={activeTab === "upcoming" ? "default" : "outline"}
          onClick={() => setActiveTab("upcoming")}
          className="flex items-center gap-2"
          size={isMobile ? "icon" : "default"}
          title={isMobile ? "الفعاليات القادمة" : undefined}
        >
          {isMobile ? (
            <Calendar className="h-4 w-4" />
          ) : (
            "الفعاليات القادمة"
          )}
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className="flex items-center gap-2"
          size={isMobile ? "icon" : "default"}
          title={isMobile ? "جميع الفعاليات" : undefined}
        >
          {isMobile ? (
            <CalendarRange className="h-4 w-4" />
          ) : (
            "جميع الفعاليات"
          )}
        </Button>
        <Button
          variant={activeTab === "past" ? "default" : "outline"}
          onClick={() => setActiveTab("past")}
          className="flex items-center gap-2"
          size={isMobile ? "icon" : "default"}
          title={isMobile ? "الفعاليات السابقة" : undefined}
        >
          {isMobile ? (
            <History className="h-4 w-4" />
          ) : (
            "الفعاليات السابقة"
          )}
        </Button>
      </div>

      <EventsSection
        title={getTitle(activeTab)}
        events={activeTab === "all" ? events : activeTab === "upcoming" ? upcomingEvents : pastEvents}
        registrations={registrations}
        isPastEvents={activeTab === "past"}
      />
    </div>
  );
};