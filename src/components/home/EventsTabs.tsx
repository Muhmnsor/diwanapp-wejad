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
        return "جميع الفعاليات والمشاريع";
      case "upcoming":
        return "الفعاليات والمشاريع القادمة";
      case "past":
        return "الفعاليات والمشاريع السابقة";
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
          title={isMobile ? "الفعاليات والمشاريع القادمة" : undefined}
        >
          {isMobile ? (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              الفعاليات والمشاريع القادمة
            </>
          ) : (
            "الفعاليات والمشاريع القادمة"
          )}
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 w-full md:w-auto shadow-sm hover:shadow-md transition-all ${isMobile ? 'justify-center' : ''}`}
          size={isMobile ? "default" : "default"}
          title={isMobile ? "جميع الفعاليات والمشاريع" : undefined}
        >
          {isMobile ? (
            <>
              <CalendarRange className="h-4 w-4 mr-2" />
              جميع الفعاليات والمشاريع
            </>
          ) : (
            "جميع الفعاليات والمشاريع"
          )}
        </Button>
        <Button
          variant={activeTab === "past" ? "default" : "outline"}
          onClick={() => setActiveTab("past")}
          className={`flex items-center gap-2 w-full md:w-auto shadow-sm hover:shadow-md transition-all ${isMobile ? 'justify-center' : ''}`}
          size={isMobile ? "default" : "default"}
          title={isMobile ? "الفعاليات والمشاريع السابقة" : undefined}
        >
          {isMobile ? (
            <>
              <History className="h-4 w-4 mr-2" />
              الفعاليات والمشاريع السابقة
            </>
          ) : (
            "الفعاليات والمشاريع السابقة"
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