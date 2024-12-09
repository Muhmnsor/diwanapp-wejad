import { Navigation } from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";
import { useEventStore } from "@/store/eventStore";

const mockEvents = [
  {
    id: "1",
    title: "مؤتمر التكنولوجيا السنوي",
    date: "١٥ مايو ٢٠٢٤",
    location: "الرياض",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    eventType: "in-person" as const,
    price: 500,
  },
  {
    id: "2",
    title: "ورشة عمل تطوير التطبيقات",
    date: "٢٠ مايو ٢٠٢٤",
    location: "جدة",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    eventType: "online" as const,
    price: "free" as const,
  },
  {
    id: "3",
    title: "معرض الفنون التشكيلية",
    date: "٢٥ مايو ٢٠٢٤",
    location: "الدمام",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    eventType: "in-person" as const,
    price: 100,
  },
];

const Index = () => {
  const storeEvents = useEventStore((state) => state.events);

  const allEvents = [
    ...mockEvents,
    ...storeEvents.map((event, index) => ({
      id: `dynamic-${index + 1}`,
      title: event.title,
      date: event.date,
      location: event.location,
      imageUrl: event.imageUrl,
      eventType: event.eventType,
      price: event.price,
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">الفعاليات القادمة</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
          {allEvents.map((event) => (
            <div key={event.id} className="w-full">
              <EventCard {...event} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;