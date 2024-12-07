import { Navigation } from "@/components/Navigation";
import { EventCard } from "@/components/EventCard";

// Temporary mock data combined with dynamic events
const mockEvents = [
  {
    id: "1",
    title: "مؤتمر التكنولوجيا السنوي",
    date: "١٥ مايو ٢٠٢٤",
    location: "الرياض",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "2",
    title: "ورشة عمل تطوير التطبيقات",
    date: "٢٠ مايو ٢٠٢٤",
    location: "جدة",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "3",
    title: "معرض الفنون التشكيلية",
    date: "٢٥ مايو ٢٠٢٤",
    location: "الدمام",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
  },
];

// Get the events array from CreateEvent component
declare const events: any[];

const Index = () => {
  // Combine mock events with dynamically created events
  const allEvents = [
    ...mockEvents,
    ...events.map((event, index) => ({
      id: `dynamic-${index + 1}`,
      title: event.title,
      date: event.date,
      location: event.location,
      imageUrl: event.imageUrl || "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">الفعاليات القادمة</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;