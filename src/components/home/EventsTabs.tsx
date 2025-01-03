import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EventCard } from "@/components/EventCard";
import { useEvents } from "@/hooks/useEvents";
import { Loader2 } from "lucide-react";
import { Event } from "@/types/event";

export const EventsTabs = () => {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingEvents = events?.filter(event => !event.is_project_activity) || [];
  const projectActivities = events?.filter(event => event.is_project_activity) || [];

  return (
    <Tabs defaultValue="upcoming" dir="rtl" className="w-full space-y-8">
      <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 bg-secondary/20">
        <TabsTrigger value="upcoming" className="data-[state=active]:bg-white">
          الفعاليات القادمة
        </TabsTrigger>
        <TabsTrigger value="activities" className="data-[state=active]:bg-white">
          أنشطة المشاريع
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-8 animate-fade-in">
        {upcomingEvents.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            لا توجد فعاليات قادمة حالياً
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event: Event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="activities" className="space-y-8 animate-fade-in">
        {projectActivities.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            لا توجد أنشطة مشاريع حالياً
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projectActivities.map((event: Event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};