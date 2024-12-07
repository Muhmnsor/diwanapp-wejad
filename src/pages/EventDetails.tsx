import { Navigation } from "@/components/Navigation";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Share2, Users } from "lucide-react";

// Temporary mock data - will be replaced with real data fetching
const mockEvent = {
  id: "1",
  title: "مؤتمر التكنولوجيا السنوي",
  description: "انضم إلينا في مؤتمر التكنولوجيا السنوي حيث نستكشف أحدث التقنيات والاتجاهات في عالم التكنولوجيا. سيتضمن المؤتمر متحدثين بارزين، وورش عمل تفاعلية، وفرص للتواصل مع خبراء الصناعة.",
  date: "١٥ مايو ٢٠٢٤",
  time: "٢:٠٠ مساءً",
  location: "فندق الريتز كارلتون، الرياض",
  imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80",
  attendees: 150,
};

const EventDetails = () => {
  const { id } = useParams();
  console.log("Event ID:", id);

  return (
    <div dir="rtl">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <img
            src={mockEvent.imageUrl}
            alt={mockEvent.title}
            className="w-full h-[400px] object-cover rounded-lg mb-8"
          />

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">{mockEvent.title}</h1>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 text-gray-600">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span>{mockEvent.date}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="h-5 w-5 text-primary" />
                <span>{mockEvent.time}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{mockEvent.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Users className="h-5 w-5 text-primary" />
                <span>{mockEvent.attendees} مشارك</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">عن الفعالية</h2>
              <p className="text-gray-600 leading-relaxed">{mockEvent.description}</p>
            </div>

            <div className="flex justify-center">
              <Button size="lg" className="w-full md:w-auto">
                تسجيل الحضور
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;