import { EventCard } from "@/components/EventCard";
import { Event } from "@/types/event";

interface EventsSectionProps {
  title: string;
  events: Event[];
  registrations: Record<string, any>;
  isPastEvents?: boolean;
}

export const EventsSection = ({ 
  title, 
  events, 
  registrations, 
  isPastEvents = false 
}: EventsSectionProps) => {
  if (!events?.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        لا توجد فعاليات حالياً
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <h2 className="text-3xl font-bold text-right">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="flex justify-center">
            <EventCard {...event} />
          </div>
        ))}
      </div>
    </section>
  );
};